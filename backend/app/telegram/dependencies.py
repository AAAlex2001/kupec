"""Telegram: репозиторий привязок, клиент бота и сценарий событий."""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_session
from app.core.telegram import TelegramClient
from app.telegram.services.repo import TelegramLinkRepository
from app.telegram.services.usecases.handle_update import HandleUpdateUseCase


def get_link_repository(session: AsyncSession = Depends(get_session)) -> TelegramLinkRepository:
    """Репозиторий привязок Telegram с сессией текущего запроса."""

    return TelegramLinkRepository(session)


def get_telegram_client() -> TelegramClient:
    """Клиент бота с настройками из .env."""

    return TelegramClient(get_settings())


def get_handle_update_usecase(
    links: TelegramLinkRepository = Depends(get_link_repository),
    client: TelegramClient = Depends(get_telegram_client),
) -> HandleUpdateUseCase:
    """Сценарий событий бота."""

    return HandleUpdateUseCase(links, client, get_settings())
