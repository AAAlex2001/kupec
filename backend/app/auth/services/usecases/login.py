"""Сценарий входа по коду из письма."""

from datetime import datetime, timedelta, timezone

from app.auth.models import CodePurpose, Session
from app.auth.schemas import LoginSchema
from app.auth.services.codes import use_code
from app.auth.services.repo import AuthCodeRepository, SessionRepository
from app.core.config import Settings
from app.core.tokens import create_session_token, hash_session_token
from app.users.models import User
from app.users.services.repo import UserRepository
from app.users.services.validators import normalize_email


class LoginUseCase:
    """Сверить код и открыть сессию. Первый вход с этим email создаёт аккаунт."""

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

    async def execute(self, payload: LoginSchema) -> tuple[User, str]:
        """Вернуть пользователя и токен для cookie. Бросает ошибки неверного и истёкшего кода."""

        email = normalize_email(payload.email)
        now = datetime.now(timezone.utc)

        auth_code = await self.codes.get_active_for_email(email, CodePurpose.LOGIN, now)
        await use_code(self.codes, auth_code, payload.code, self.settings.code_max_attempts)

        user = await self.users.get_by_email(email)
        if user is None:
            user = await self.users.add(User(email=email))

        token = create_session_token()
        await self.sessions.add(
            Session(
                user_id=user.id,
                token_hash=hash_session_token(token),
                expires_at=now + timedelta(days=self.settings.session_expires_days),
            )
        )

        return user, token
