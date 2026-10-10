"""Отправить в IndexNow все опубликованные статьи, чтобы Яндекс обошёл их за минуты.

Статьи, сохранённые в админке, уходят в IndexNow сами. Скрипт нужен для тех, что пришли миграцией.
Запуск из backend (или в контейнере): python -m scripts.notify_indexnow
"""

import asyncio

from sqlalchemy import select

from app.articles.models import Article, ArticleStatus
from app.core.config import get_settings
from app.core.database import SessionLocal, engine
from app.core.indexnow import IndexNowClient


async def main() -> None:
    """Собрать адреса опубликованных статей и отправить их одним запросом."""

    async with SessionLocal() as session:
        result = await session.execute(select(Article).where(Article.status == ArticleStatus.PUBLISHED))
        paths = [article.path for article in result.scalars().all()]

    await engine.dispose()

    await IndexNowClient(get_settings()).notify(paths)
    print(f"IndexNow: отправлено адресов — {len(paths)}. Ошибки, если были, — в логе выше.")


if __name__ == "__main__":
    asyncio.run(main())
