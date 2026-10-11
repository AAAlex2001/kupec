"""Бот без webhook: сам забирает события у Telegram через прокси.

Входящие соединения от Telegram до сервера режутся, исходящие через прокси работают.
Запускается отдельным контейнером в одном экземпляре: python -m app.telegram.polling
app.models подключает все таблицы, иначе SQLAlchemy не найдёт users для внешнего ключа.
Журнал httpx выключен: в адресах запросов к Telegram есть токен бота.
"""

import asyncio
import logging

from sqlalchemy.exc import SQLAlchemyError

import app.models  # noqa: F401
from app.core.config import get_settings
from app.core.database import SessionLocal
from app.core.telegram import TelegramClient, TelegramError
from app.telegram.services.repo import TelegramLinkRepository
from app.telegram.services.usecases.handle_update import HandleUpdateUseCase

RETRY_SECONDS = 5

logger = logging.getLogger(__name__)


async def remove_webhook(client: TelegramClient) -> None:
    """Снять webhook. Повторять, пока Telegram не ответит."""

    while True:
        try:
            await client.delete_webhook()
            return
        except TelegramError as error:
            logger.warning("Не удалось снять webhook: %s", error)
            await asyncio.sleep(RETRY_SECONDS)


async def fetch_updates(client: TelegramClient, offset: int) -> list[dict]:
    """Новые события. Сбой сети или прокси — пауза и пустой список."""

    try:
        return await client.get_updates(offset)
    except TelegramError as error:
        logger.warning("Бот не получил события: %s", error)
        await asyncio.sleep(RETRY_SECONDS)
        return []


async def handle(client: TelegramClient, update: dict) -> None:
    """Обработать одно событие в своей сессии БД. Сбой Telegram или базы — в лог, бот работает дальше."""

    async with SessionLocal() as session:
        usecase = HandleUpdateUseCase(TelegramLinkRepository(session), client, get_settings())
        try:
            await usecase.execute(update)
        except TelegramError as error:
            logger.warning("Бот не ответил в Telegram: %s", error)
        except SQLAlchemyError as error:
            logger.error("Событие %s не сохранено: %s", update.get("update_id"), error)


async def main() -> None:
    """Забирать события по кругу. offset подтверждает Telegram, что прежние уже обработаны."""

    logging.basicConfig(level=logging.INFO)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    settings = get_settings()
    if not settings.telegram_bot_token:
        logger.info("TELEGRAM_BOT_TOKEN не задан — бот выключен")
        await asyncio.Event().wait()

    client = TelegramClient(settings)
    await remove_webhook(client)
    logger.info("Бот слушает события")

    offset = 0
    while True:
        for update in await fetch_updates(client, offset):
            offset = update["update_id"] + 1
            await handle(client, update)


if __name__ == "__main__":
    asyncio.run(main())
