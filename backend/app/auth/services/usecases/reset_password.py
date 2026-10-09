"""Сценарии восстановления пароля кодом из письма."""

from datetime import datetime, timezone

from app.auth.models import CodePurpose
from app.auth.schemas import PasswordResetSchema
from app.auth.services.codes import use_code
from app.auth.services.repo import AuthCodeRepository, SessionRepository
from app.auth.services.sessions import open_session
from app.auth.services.usecases.send_code import SendCodeUseCase
from app.core.config import Settings
from app.core.passwords import hash_password
from app.users.models import User
from app.users.services.repo import UserRepository
from app.users.services.validators import normalize_email


class RequestPasswordResetUseCase:
    """Отправить код восстановления. Есть ли аккаунт с этой почтой, снаружи не видно."""

    def __init__(self, users: UserRepository, send_code: SendCodeUseCase) -> None:
        self.users = users
        self.send_code = send_code

    async def execute(self, email: str) -> None:
        """Отправить код, если такой аккаунт есть."""

        email = normalize_email(email)
        user = await self.users.get_by_email(email)

        if user is not None:
            await self.send_code.execute(email, CodePurpose.RESET_PASSWORD, user.id)


class ResetPasswordUseCase:
    """Задать новый пароль по коду из письма и сразу войти. Почта при этом подтверждается."""

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

    async def execute(self, payload: PasswordResetSchema) -> tuple[User, str]:
        """Вернуть пользователя и токен для cookie. Бросает ошибки неверного и истёкшего кода."""

        email = normalize_email(payload.email)
        now = datetime.now(timezone.utc)

        auth_code = await self.codes.get_active_for_email(email, CodePurpose.RESET_PASSWORD, now)
        await use_code(self.codes, auth_code, payload.code, self.settings.code_max_attempts)

        user = await self.users.get_by_email(email)
        user.password_hash = hash_password(payload.password)
        user.email_verified = True
        user.failed_logins = 0
        user.locked_until = None
        user = await self.users.save(user)

        return user, await open_session(self.sessions, user, self.settings)
