"""Фоновая задача кросспостинга: запускается после ответа сайту, сбой пишется в лог."""

import logging

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.core.telegram import TelegramClient, TelegramError
from app.posts.services.repo import PostRepository
from app.telegram.services.repo import TelegramLinkRepository
from app.telegram.services.usecases.publish_post import PublishPostUseCase

logger = logging.getLogger(__name__)


async def publish_post(post_id: int) -> None:
    """Отправить пост в Telegram-канал автора."""

    settings = get_settings()
    async with SessionLocal() as session:
        posts = PostRepository(session)
        post = await posts.get_by_id(post_id)
        if post is None:
            return

        usecase = PublishPostUseCase(posts, TelegramLinkRepository(session), TelegramClient(settings), settings)
        try:
            await usecase.execute(post)
        except TelegramError as error:
            logger.warning("Пост %s не отправлен в Telegram: %s", post_id, error)
