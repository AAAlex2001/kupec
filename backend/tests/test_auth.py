"""Тесты входа по коду и смены почты без БД."""

import asyncio
from datetime import datetime, timedelta, timezone

import pytest

from app.auth.models import CodePurpose
from app.auth.schemas import CodeConfirmSchema, CodeRequestSchema, LoginSchema
from app.auth.services.exceptions import (
    CodeExpiredError,
    EmailAlreadyTakenError,
    InvalidCodeError,
    SameEmailError,
    TooManyCodesError,
)
from app.auth.services.usecases.change_email import (
    ConfirmEmailChangeUseCase,
    RequestEmailChangeUseCase,
)
from app.auth.services.usecases.login import LoginUseCase
from app.auth.services.usecases.send_code import SendCodeUseCase
from app.auth.services.validators import check_code_limit, wait_message
from app.core.tokens import hash_session_token
from app.users.models import User
from tests.fakes import (
    FakeCodeRepository,
    FakeMailer,
    FakeSessionRepository,
    FakeUserRepository,
    make_settings,
)

EMAIL = "anna@mail.ru"


class Auth:
    """Сценарии входа на общих репозиториях в памяти."""

    def __init__(self) -> None:
        self.settings = make_settings()
        self.codes = FakeCodeRepository()
        self.users = FakeUserRepository()
        self.sessions = FakeSessionRepository()
        self.mailer = FakeMailer()
        self.send_code = SendCodeUseCase(self.codes, self.mailer, self.settings)

    def send_login_code(self, email: str = EMAIL) -> str:
        asyncio.run(self.send_code.execute(email, CodePurpose.LOGIN))

        return self.mailer.last_code()

    def login(self, code: str, email: str = EMAIL) -> tuple[User, str]:
        usecase = LoginUseCase(self.codes, self.users, self.sessions, self.settings)

        return asyncio.run(usecase.execute(LoginSchema(email=email, code=code)))

    def allow_resend(self) -> None:
        """Сдвинуть выданные коды в прошлое, чтобы не ждать паузу между письмами."""

        for code in self.codes.items:
            code.created_at -= timedelta(minutes=2)


def wrong(code: str) -> str:
    return f"{(int(code) + 1) % 1_000_000:06d}"


def test_code_is_mailed_and_stored_only_as_hash() -> None:
    auth = Auth()

    code = auth.send_login_code()

    assert auth.mailer.sent[0][0] == EMAIL
    assert len(auth.codes.items) == 1
    assert auth.codes.items[0].code_hash != code


def test_code_cannot_be_requested_again_right_away() -> None:
    auth = Auth()
    auth.send_login_code()

    with pytest.raises(TooManyCodesError) as error:
        auth.send_login_code()

    assert 0 < error.value.retry_after <= 60
    assert len(auth.mailer.sent) == 1


def test_hourly_limit_counts_codes_of_the_last_hour() -> None:
    now = datetime.now(timezone.utc)
    issued = [now - timedelta(minutes=minutes) for minutes in (50, 40, 30, 20, 10)]

    with pytest.raises(TooManyCodesError) as error:
        check_code_limit(issued, now, resend_seconds=60, per_hour=5)

    assert error.value.retry_after == 10 * 60


def test_wait_message_shows_minutes_for_long_waits() -> None:
    assert wait_message(45) == "Новый код можно запросить через 45 с"
    assert wait_message(715) == "Новый код можно запросить через 12 мин"


def test_first_login_creates_user_without_name() -> None:
    auth = Auth()
    code = auth.send_login_code()

    user, token = auth.login(code, email="ANNA@mail.ru")

    assert (user.email, user.name) == (EMAIL, None)
    assert auth.sessions.items[0].token_hash == hash_session_token(token)
    assert auth.sessions.items[0].token_hash != token


def test_next_login_returns_the_same_user() -> None:
    auth = Auth()
    first, _ = auth.login(auth.send_login_code())
    auth.allow_resend()

    second, _ = auth.login(auth.send_login_code())

    assert second.id == first.id
    assert len(auth.users.items) == 1
    assert len(auth.sessions.items) == 2


def test_code_works_only_once() -> None:
    auth = Auth()
    code = auth.send_login_code()
    auth.login(code)

    with pytest.raises(CodeExpiredError):
        auth.login(code)


def test_wrong_code_burns_attempts_then_code_dies() -> None:
    auth = Auth()
    code = auth.send_login_code()

    with pytest.raises(InvalidCodeError) as error:
        auth.login(wrong(code))
    assert error.value.attempts_left == 4

    for _ in range(3):
        with pytest.raises(InvalidCodeError):
            auth.login(wrong(code))

    with pytest.raises(CodeExpiredError):
        auth.login(wrong(code))

    with pytest.raises(CodeExpiredError):
        auth.login(code)


def test_expired_code_is_rejected() -> None:
    auth = Auth()
    code = auth.send_login_code()
    auth.codes.items[0].expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)

    with pytest.raises(CodeExpiredError):
        auth.login(code)


def test_code_for_one_email_does_not_open_another() -> None:
    auth = Auth()
    code = auth.send_login_code()

    with pytest.raises(CodeExpiredError):
        auth.login(code, email="other@mail.ru")


def test_email_change_rejects_current_and_taken_addresses() -> None:
    auth = Auth()
    user, _ = auth.login(auth.send_login_code())
    auth.allow_resend()
    auth.login(auth.send_login_code("taken@mail.ru"), email="taken@mail.ru")
    usecase = RequestEmailChangeUseCase(auth.users, auth.send_code)

    with pytest.raises(SameEmailError):
        asyncio.run(usecase.execute(user, CodeRequestSchema(email="Anna@Mail.ru")))

    with pytest.raises(EmailAlreadyTakenError):
        asyncio.run(usecase.execute(user, CodeRequestSchema(email="taken@mail.ru")))


def test_email_changes_after_code_from_new_address() -> None:
    auth = Auth()
    user, _ = auth.login(auth.send_login_code())
    request = RequestEmailChangeUseCase(auth.users, auth.send_code)
    confirm = ConfirmEmailChangeUseCase(auth.codes, auth.users, auth.settings)

    asyncio.run(request.execute(user, CodeRequestSchema(email="new@mail.ru")))

    assert auth.mailer.sent[-1][0] == "new@mail.ru"
    assert user.email == EMAIL

    updated = asyncio.run(
        confirm.execute(user, CodeConfirmSchema(code=auth.mailer.last_code()))
    )

    assert updated.email == "new@mail.ru"
