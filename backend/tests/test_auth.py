"""Тесты регистрации, входа по паролю, восстановления пароля и смены почты без БД."""

import asyncio
from datetime import datetime, timedelta, timezone

import pytest

from app.auth.models import CodePurpose
from app.auth.schemas import (
    CodeConfirmSchema,
    CodeRequestSchema,
    EmailCodeSchema,
    LoginSchema,
    PasswordResetSchema,
    RegisterSchema,
)
from app.auth.services.exceptions import (
    CodeExpiredError,
    EmailAlreadyTakenError,
    EmailNotVerifiedError,
    InvalidCodeError,
    InvalidCredentialsError,
    LoginLockedError,
    SameEmailError,
    TooManyCodesError,
)
from app.auth.services.letters import code_letter
from app.auth.services.usecases.change_email import (
    ConfirmEmailChangeUseCase,
    RequestEmailChangeUseCase,
)
from app.auth.services.usecases.login import LoginUseCase
from app.auth.services.usecases.register import ConfirmEmailUseCase, RegisterUseCase
from app.auth.services.usecases.reset_password import (
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
)
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
PASSWORD = "огурцы-2026"


class Auth:
    """Сценарии входа на общих репозиториях в памяти."""

    def __init__(self) -> None:
        self.settings = make_settings()
        self.codes = FakeCodeRepository()
        self.users = FakeUserRepository()
        self.sessions = FakeSessionRepository()
        self.mailer = FakeMailer()
        self.send_code = SendCodeUseCase(self.codes, self.mailer, self.settings)

    def register(self, email: str = EMAIL, password: str = PASSWORD) -> str:
        """Зарегистрироваться и вернуть код из письма."""

        usecase = RegisterUseCase(self.users, self.send_code)
        asyncio.run(usecase.execute(RegisterSchema(email=email, password=password)))

        return self.mailer.last_code()

    def confirm(self, code: str, email: str = EMAIL) -> tuple[User, str]:
        usecase = ConfirmEmailUseCase(self.codes, self.users, self.sessions, self.settings)

        return asyncio.run(usecase.execute(EmailCodeSchema(email=email, code=code)))

    def login(self, password: str = PASSWORD, email: str = EMAIL) -> tuple[User, str]:
        usecase = LoginUseCase(self.users, self.sessions, self.settings)

        return asyncio.run(usecase.execute(LoginSchema(email=email, password=password)))

    def signed_up(self, email: str = EMAIL) -> User:
        """Пользователь, который зарегистрировался и подтвердил почту."""

        user, _ = self.confirm(self.register(email), email)

        return user

    def allow_resend(self) -> None:
        """Сдвинуть выданные коды в прошлое, чтобы не ждать паузу между письмами."""

        for code in self.codes.items:
            code.created_at -= timedelta(minutes=2)


def wrong(code: str) -> str:
    return f"{(int(code) + 1) % 1_000_000:06d}"


def test_register_stores_password_hash_and_mails_code() -> None:
    auth = Auth()

    code = auth.register()
    user = auth.users.items[1]

    assert auth.mailer.sent[0][0] == EMAIL
    assert auth.codes.items[0].code_hash != code
    assert user.password_hash is not None and PASSWORD not in user.password_hash
    assert user.email_verified is False


def test_code_letter_has_code_logo_and_site_link() -> None:
    letter = code_letter(CodePurpose.RESET_PASSWORD, "123456", 10, "https://kupecmarket.ru/")

    assert letter.subject == "Восстановление пароля в Купце"
    assert "123456" in letter.text and "123456" in letter.html
    assert 'src="https://kupecmarket.ru/email/logo.png"' in letter.html
    assert "Код действует 10 минут" in letter.html
    assert "$" not in letter.html


def test_code_cannot_be_requested_again_right_away() -> None:
    auth = Auth()
    auth.register()

    with pytest.raises(TooManyCodesError) as error:
        auth.register()

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


def test_confirmed_email_opens_session() -> None:
    auth = Auth()

    user, token = auth.confirm(auth.register(email="ANNA@mail.ru"))

    assert user.email == EMAIL
    assert user.email_verified is True
    assert auth.sessions.items[0].token_hash == hash_session_token(token)


def test_verified_email_cannot_be_registered_again() -> None:
    auth = Auth()
    auth.signed_up()
    auth.allow_resend()

    with pytest.raises(EmailAlreadyTakenError):
        auth.register()


def test_login_needs_right_password_and_confirmed_email() -> None:
    auth = Auth()
    auth.register()

    with pytest.raises(EmailNotVerifiedError):
        auth.login()

    auth.confirm(auth.mailer.last_code())

    with pytest.raises(InvalidCredentialsError):
        auth.login("не тот пароль")

    with pytest.raises(InvalidCredentialsError):
        auth.login(email="nobody@mail.ru")

    user, _ = auth.login()
    assert user.email == EMAIL


def test_login_locks_after_too_many_wrong_passwords() -> None:
    auth = Auth()
    auth.signed_up()

    for _ in range(auth.settings.login_max_attempts):
        with pytest.raises(InvalidCredentialsError):
            auth.login("не тот пароль")

    with pytest.raises(LoginLockedError):
        auth.login()


def test_wrong_code_burns_attempts_then_code_dies() -> None:
    auth = Auth()
    code = auth.register()

    with pytest.raises(InvalidCodeError) as error:
        auth.confirm(wrong(code))
    assert error.value.attempts_left == 4

    for _ in range(3):
        with pytest.raises(InvalidCodeError):
            auth.confirm(wrong(code))

    with pytest.raises(CodeExpiredError):
        auth.confirm(wrong(code))

    with pytest.raises(CodeExpiredError):
        auth.confirm(code)


def test_code_for_one_email_does_not_confirm_another() -> None:
    auth = Auth()
    code = auth.register()

    with pytest.raises(CodeExpiredError):
        auth.confirm(code, email="other@mail.ru")


def test_password_reset_sets_new_password() -> None:
    auth = Auth()
    auth.signed_up()
    auth.allow_resend()

    asyncio.run(RequestPasswordResetUseCase(auth.users, auth.send_code).execute(EMAIL))
    reset = ResetPasswordUseCase(auth.codes, auth.users, auth.sessions, auth.settings)
    payload = PasswordResetSchema(email=EMAIL, code=auth.mailer.last_code(), password="новый-пароль")
    asyncio.run(reset.execute(payload))

    with pytest.raises(InvalidCredentialsError):
        auth.login()

    user, _ = auth.login("новый-пароль")
    assert user.email == EMAIL


def test_password_reset_for_unknown_email_sends_nothing() -> None:
    auth = Auth()

    asyncio.run(RequestPasswordResetUseCase(auth.users, auth.send_code).execute("nobody@mail.ru"))

    assert auth.mailer.sent == []


def test_email_change_rejects_current_and_taken_addresses() -> None:
    auth = Auth()
    user = auth.signed_up()
    auth.signed_up("taken@mail.ru")
    usecase = RequestEmailChangeUseCase(auth.users, auth.send_code)

    with pytest.raises(SameEmailError):
        asyncio.run(usecase.execute(user, CodeRequestSchema(email="Anna@Mail.ru")))

    with pytest.raises(EmailAlreadyTakenError):
        asyncio.run(usecase.execute(user, CodeRequestSchema(email="taken@mail.ru")))


def test_email_changes_after_code_from_new_address() -> None:
    auth = Auth()
    user = auth.signed_up()
    request = RequestEmailChangeUseCase(auth.users, auth.send_code)
    confirm = ConfirmEmailChangeUseCase(auth.codes, auth.users, auth.settings)

    asyncio.run(request.execute(user, CodeRequestSchema(email="new@mail.ru")))

    assert auth.mailer.sent[-1][0] == "new@mail.ru"
    assert user.email == EMAIL

    updated = asyncio.run(
        confirm.execute(user, CodeConfirmSchema(code=auth.mailer.last_code()))
    )

    assert updated.email == "new@mail.ru"
