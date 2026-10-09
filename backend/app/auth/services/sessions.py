"""Открытие сессии входа: общий шаг входа, подтверждения почты и сброса пароля."""

from datetime import datetime, timedelta, timezone

from app.auth.models import Session
from app.auth.services.repo import SessionRepository
from app.core.config import Settings
from app.core.tokens import create_session_token, hash_session_token
from app.users.models import User


async def open_session(sessions: SessionRepository, user: User, settings: Settings) -> str:
    """Создать сессию пользователя и вернуть токен для cookie. В базе — только его хеш."""

    token = create_session_token()
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.session_expires_days)

    await sessions.add(
        Session(user_id=user.id, token_hash=hash_session_token(token), expires_at=expires_at)
    )

    return token
