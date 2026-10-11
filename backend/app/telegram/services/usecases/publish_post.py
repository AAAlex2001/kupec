"""Сценарий кросспостинга: новый пост с сайта в Telegram-канал автора."""

import asyncio

from app.core.config import Settings
from app.core.telegram import TelegramClient
from app.posts.models import Post
from app.telegram.services.markup import fit_text, fits, join_blocks
from app.telegram.services.message import post_blocks, post_url, telegram_files
from app.telegram.services.repo import TelegramLinkRepository

CAPTION_LIMIT = 1024
TEXT_LIMIT = 4096


class PublishPostUseCase:
    """Отправить пост в канал автора с разметкой, фото и видео."""

    def __init__(self, links: TelegramLinkRepository, client: TelegramClient, settings: Settings) -> None:
        self.links = links
        self.client = client
        self.settings = settings

    async def execute(self, post: Post) -> None:
        """Без файлов — одно сообщение. С файлами — текст в подписи, а длиннее 1024 символов — следом отдельно.

        Канал не подключён — ничего не делать.
        """

        link = await self.links.get_by_user(post.author_id)
        if link is None or link.channel_id is None:
            return

        blocks = post_blocks(post, self.settings.site_url)
        text = fit_text(blocks, TEXT_LIMIT, post_url(self.settings.site_url, post.id))

        if not post.media:
            await self.client.send_text(link.channel_id, text)
            return

        files = await asyncio.to_thread(telegram_files, post.media, self.settings.media_dir)
        if fits(blocks, CAPTION_LIMIT):
            await self.client.send_media(link.channel_id, files, join_blocks(blocks).html)
            return

        await self.client.send_media(link.channel_id, files, "")
        await self.client.send_text(link.channel_id, text)
