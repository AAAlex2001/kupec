"""Запросы к Telegram Bot API: текст, фото и видео в канал, события бота."""

import json
from dataclasses import dataclass

import httpx

from app.core.config import Settings

API_URL = "https://api.telegram.org"
TIMEOUT_SECONDS = 120
POLL_SECONDS = 50


class TelegramError(Exception):
    """Telegram не выполнил запрос: нет токена, сеть, нет прав в канале или неверные данные."""


@dataclass
class TelegramFile:
    """Фото или видео для отправки: вид, имя файла и содержимое."""

    kind: str
    name: str
    content: bytes


class TelegramClient:
    """Клиент бота с токеном из .env."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def call(self, method: str, data: dict, files: dict | None = None) -> dict | list | bool:
        """Вызвать метод Bot API и вернуть result. С TELEGRAM_PROXY — через прокси. Ошибки — TelegramError."""

        token = self.settings.telegram_bot_token
        if not token:
            raise TelegramError("Не задан TELEGRAM_BOT_TOKEN")

        proxy = self.settings.telegram_proxy or None
        try:
            async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS, proxy=proxy) as client:
                response = await client.post(f"{API_URL}/bot{token}/{method}", data=data, files=files)
                answer = response.json()
        except (httpx.HTTPError, ValueError) as error:
            raise TelegramError(f"{method}: {error}") from error

        if not answer.get("ok"):
            raise TelegramError(f"{method}: {answer.get('description', 'нет ответа')}")

        return answer["result"]

    async def send_text(self, chat_id: int, html: str) -> None:
        """Отправить текст с HTML-разметкой."""

        await self.call("sendMessage", {"chat_id": chat_id, "text": html, "parse_mode": "HTML"})

    async def send_media(self, chat_id: int, items: list[TelegramFile], caption: str) -> None:
        """Отправить одно фото или видео либо альбом до 10 штук. Подпись — у первого."""

        if len(items) == 1:
            item = items[0]
            method = "sendPhoto" if item.kind == "photo" else "sendVideo"
            data = {"chat_id": chat_id, "caption": caption, "parse_mode": "HTML"}
            await self.call(method, data, {item.kind: (item.name, item.content)})
            return

        media = []
        files = {}
        for index, item in enumerate(items):
            entry = {"type": item.kind, "media": f"attach://file{index}"}
            if index == 0:
                entry.update({"caption": caption, "parse_mode": "HTML"})
            media.append(entry)
            files[f"file{index}"] = (item.name, item.content)

        await self.call("sendMediaGroup", {"chat_id": chat_id, "media": json.dumps(media)}, files)

    async def delete_webhook(self) -> None:
        """Снять webhook: пока он включён, Telegram не отдаёт события через getUpdates."""

        await self.call("deleteWebhook", {})

    async def get_updates(self, offset: int) -> list[dict]:
        """Новые события бота после offset. Если их нет, Telegram держит запрос до 50 секунд."""

        updates = json.dumps(["message", "my_chat_member"])

        return await self.call("getUpdates", {"offset": offset, "timeout": POLL_SECONDS, "allowed_updates": updates})
