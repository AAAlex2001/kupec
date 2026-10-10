"""IndexNow: сообщить Яндексу и Bing о новых и изменённых страницах, чтобы их обошли за минуты."""

import logging

import httpx

from app.core.config import Settings

ENDPOINT = "https://yandex.com/indexnow"
BATCH = 100
TIMEOUT_SECONDS = 15

logger = logging.getLogger(__name__)


class IndexNowClient:
    """Отправка адресов в IndexNow. Ключ подтверждается файлом /<ключ>.txt на сайте."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def notify(self, paths: list[str]) -> None:
        """Отправить страницы сайта по путям вида /news/slug. Сбой только пишется в лог."""

        site_url = self.settings.site_url.rstrip("/")
        key = self.settings.indexnow_key
        if not key or not paths or "localhost" in site_url:
            return

        for start in range(0, len(paths), BATCH):
            payload = {
                "host": site_url.split("://")[-1],
                "key": key,
                "keyLocation": f"{site_url}/{key}.txt",
                "urlList": [f"{site_url}{path}" for path in paths[start : start + BATCH]],
            }

            try:
                async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
                    response = await client.post(ENDPOINT, json=payload)
                    response.raise_for_status()
            except httpx.HTTPError as error:
                logger.warning("IndexNow не принял адреса: %s", error)
