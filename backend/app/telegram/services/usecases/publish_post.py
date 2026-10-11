"""Сценарий кросспостинга: новый пост с сайта в Telegram-канал автора."""

import asyncio

from app.core.config import Settings
from app.core.telegram import TelegramClient
from app.posts.models import Post
from app.posts.services.repo import PostRepository
from app.telegram.services.markup import fit_text, fits, join_blocks
from app.telegram.services.message import message_url, post_blocks, post_url, telegram_files
from app.telegram.services.repo import TelegramLinkRepository

CAPTION_LIMIT = 1024
TEXT_LIMIT = 4096


class PublishPostUseCase:
    """Отправить пост в канал автора с разметкой, фото и видео и запомнить ссылку на него."""

    def __init__(
        self,
        posts: PostRepository,
        links: TelegramLinkRepository,
        client: TelegramClient,
        settings: Settings,
    ) -> None:
        self.posts = posts
        self.links = links
        self.client = client
        self.settings = settings

    async def execute(self, post: Post) -> None:
        """Отправить пост и сохранить ссылку на первое сообщение. Канал не подключён — ничего не делать."""

        link = await self.links.get_by_user(post.author_id)
        if link is None or link.channel_id is None:
            return

        message = await self.send(post, link.channel_id)
        await self.posts.set_telegram_url(post.id, message_url(message))

    async def send(self, post: Post, chat_id: int) -> dict:
        """Без файлов — одно сообщение. С файлами — текст в подписи, а длиннее 1024 символов — следом отдельно."""

        blocks = post_blocks(post, self.settings.site_url)
        text = fit_text(blocks, TEXT_LIMIT, post_url(self.settings.site_url, post.id))

        if not post.media:
            return await self.client.send_text(chat_id, text)

        files = await asyncio.to_thread(telegram_files, post.media, self.settings.media_dir)
        if fits(blocks, CAPTION_LIMIT):
            return await self.client.send_media(chat_id, files, join_blocks(blocks).html)

        message = await self.client.send_media(chat_id, files, "")
        await self.client.send_text(chat_id, text)

        return message
