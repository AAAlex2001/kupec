"""Сценарии регистрации: почта и пароль, затем подтверждение почты кодом."""

from datetime import datetime, timezone

from app.auth.models import CodePurpose
from app.auth.schemas import EmailCodeSchema, RegisterSchema
from app.auth.services.codes import use_code
from app.auth.services.exceptions import EmailAlreadyTakenError
from app.auth.services.repo import AuthCodeRepository, SessionRepository
from app.auth.services.sessions import open_session
from app.auth.services.usecases.send_code import SendCodeUseCase
from app.core.config import Settings
from app.core.passwords import hash_password
from app.users.models import User
from app.users.services.repo import UserRepository
from app.users.services.validators import normalize_email


class RegisterUseCase:
    """Создать аккаунт с паролем и отправить код подтверждения почты.

    Если почта уже зарегистрирована, но не подтверждена, пароль обновляется и код приходит снова.
    """

    def __init__(self, users: UserRepository, send_code: SendCodeUseCase) -> None:
        self.users = users
        self.send_code = send_code

    async def execute(self, payload: RegisterSchema) -> None:
        """Отправить код. Подтверждённая почта уже занята — EmailAlreadyTakenError."""

        email = normalize_email(payload.email)
        user = await self.users.get_by_email(email)

        if user is not None and user.email_verified:
            raise EmailAlreadyTakenError(email)

        if user is None:
            new_user = User(
                email=email,
                password_hash=hash_password(payload.password),
                email_verified=False,
                failed_logins=0,
            )
            user = await self.users.add(new_user)
        else:
            user.password_hash = hash_password(payload.password)
            user = await self.users.save(user)

        await self.send_code.execute(email, CodePurpose.VERIFY_EMAIL, user.id)


class ConfirmEmailUseCase:
    """Подтвердить почту кодом из письма и сразу войти."""

    def __init__(
        self,
        codes: AuthCodeRepository,
        users: UserRepository,
        sessions: SessionRepository,
        settings: Settings,
    ) -> None:
        self.codes = codes
        self.users = users
        self.sessions = sessions
        self.settings = settings

    async def execute(self, payload: EmailCodeSchema) -> tuple[User, str]:
        """Вернуть пользователя и токен для cookie. Бросает ошибки неверного и истёкшего кода."""

        email = normalize_email(payload.email)
        now = datetime.now(timezone.utc)

        auth_code = await self.codes.get_active_for_email(email, CodePurpose.VERIFY_EMAIL, now)
        await use_code(self.codes, auth_code, payload.code, self.settings.code_max_attempts)

        user = await self.users.get_by_email(email)
        user.email_verified = True
        user = await self.users.save(user)

        return user, await open_session(self.sessions, user, self.settings)
