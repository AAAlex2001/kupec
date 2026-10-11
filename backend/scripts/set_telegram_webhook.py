"""Сообщить Telegram адрес webhook бота. Запускается один раз после настройки .env.

Запуск из backend (или в контейнере): python -m scripts.set_telegram_webhook
"""

import asyncio

from app.core.config import get_settings
from app.core.telegram import TelegramClient


async def main() -> None:
    """Зарегистрировать <сайт>/api/v1/telegram/webhook с секретом из .env."""

    settings = get_settings()
    url = f"{settings.site_url.rstrip('/')}/api/v1/telegram/webhook"
    await TelegramClient(settings).set_webhook(url, settings.telegram_webhook_secret)
    print(f"Webhook бота: {url}")


if __name__ == "__main__":
    asyncio.run(main())
