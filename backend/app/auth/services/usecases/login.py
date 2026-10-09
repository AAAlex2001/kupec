"""Сценарий входа по почте и паролю."""

import math
from datetime import datetime, timedelta, timezone

from app.auth.schemas import LoginSchema
from app.auth.services.exceptions import (
    EmailNotVerifiedError,
    InvalidCredentialsError,
    LoginLockedError,
)
from app.auth.services.repo import SessionRepository
from app.auth.services.sessions import open_session
from app.core.config import Settings
from app.core.passwords import password_matches
from app.users.models import User
from app.users.services.repo import UserRepository
from app.users.services.validators import normalize_email


class LoginUseCase:
    """Проверить пароль и открыть сессию. После серии неверных паролей вход закрывается на время."""

    def __init__(self, users: UserRepository, sessions: SessionRepository, settings: Settings) -> None:
        self.users = users
        self.sessions = sessions
        self.settings = settings

    async def execute(self, payload: LoginSchema) -> tuple[User, str]:
        """Вернуть пользователя и токен для cookie."""

        now = datetime.now(timezone.utc)
        user = await self.users.get_by_email(normalize_email(payload.email))

        if user is not None and user.locked_until is not None and user.locked_until > now:
            raise LoginLockedError(math.ceil((user.locked_until - now).total_seconds() / 60))

        if user is None or not password_matches(payload.password, user.password_hash):
            await self.count_failure(user, now)
            raise InvalidCredentialsError("Неверная почта или пароль")

        if not user.email_verified:
            raise EmailNotVerifiedError(user.email)

        user.failed_logins = 0
        user.locked_until = None
        user = await self.users.save(user)

        return user, await open_session(self.sessions, user, self.settings)

    async def count_failure(self, user: User | None, now: datetime) -> None:
        """Засчитать неверный пароль. После лимита закрыть вход на несколько минут."""

        if user is None:
            return

        user.failed_logins += 1
        if user.failed_logins >= self.settings.login_max_attempts:
            user.failed_logins = 0
            user.locked_until = now + timedelta(minutes=self.settings.login_lock_minutes)

        await self.users.save(user)
