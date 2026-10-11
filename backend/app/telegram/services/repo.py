"""Репозиторий привязок Telegram: аккаунт пользователя и его канал."""

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.telegram.models import TelegramLink


class TelegramLinkRepository:
    """Доступ к таблице telegram_links. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_user(self, user_id: int) -> TelegramLink | None:
        """Привязка пользователя сайта или None."""

        return await self.db.get(TelegramLink, user_id)

    async def get_by_telegram_user(self, telegram_user_id: int) -> TelegramLink | None:
        """Привязка по аккаунту Telegram или None."""

        stmt = select(TelegramLink).where(TelegramLink.telegram_user_id == telegram_user_id)

        return await self.db.scalar(stmt)

    async def link_account(self, user_id: int, telegram_user_id: int) -> None:
        """Привязать аккаунт Telegram к пользователю. Та же пара — канал остаётся, иначе старые привязки снимаются."""

        current = await self.get_by_user(user_id)
        if current is not None and current.telegram_user_id == telegram_user_id:
            return

        await self.db.execute(
            delete(TelegramLink).where(
                (TelegramLink.user_id == user_id)
                | (TelegramLink.telegram_user_id == telegram_user_id)
            )
        )
        self.db.add(TelegramLink(user_id=user_id, telegram_user_id=telegram_user_id))
        await self.db.commit()

    async def set_channel(self, link: TelegramLink, channel_id: int, title: str) -> None:
        """Привязать канал. У прежнего владельца привязки этот канал снимается."""

        await self.clear_channel(channel_id)
        link.channel_id = channel_id
        link.channel_title = title
        await self.db.commit()

    async def clear_channel(self, channel_id: int) -> None:
        """Отвязать канал, где бот больше не администратор."""

        await self.db.execute(
            update(TelegramLink)
            .where(TelegramLink.channel_id == channel_id)
            .values(channel_id=None, channel_title=None)
        )
        await self.db.commit()

    async def delete(self, user_id: int) -> None:
        """Отключить Telegram у пользователя."""

        await self.db.execute(delete(TelegramLink).where(TelegramLink.user_id == user_id))
        await self.db.commit()
