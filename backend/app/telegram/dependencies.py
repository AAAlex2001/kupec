"""Telegram: репозиторий привязок для ручек."""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.telegram.services.repo import TelegramLinkRepository


def get_link_repository(session: AsyncSession = Depends(get_session)) -> TelegramLinkRepository:
    """Репозиторий привязок Telegram с сессией текущего запроса."""

    return TelegramLinkRepository(session)
