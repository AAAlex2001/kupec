"""Репозиторий поддержки: переписки посетителей и сообщения в них."""

from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.support.models import SupportMessage, SupportThread


class SupportRepository:
    """Доступ к таблицам поддержки. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get(self, thread_id: int) -> SupportThread | None:
        """Переписка по id или None."""

        return await self.db.get(SupportThread, thread_id)

    async def get_by_visitor(self, visitor: str) -> SupportThread | None:
        """Переписка посетителя или None, если он ещё не писал."""

        return await self.db.scalar(select(SupportThread).where(SupportThread.visitor == visitor))

    async def open_thread(self, visitor: str, user_id: int | None) -> SupportThread:
        """Переписка посетителя. Нет — создать."""

        thread = await self.get_by_visitor(visitor)
        if thread is not None:
            return thread

        thread = SupportThread(visitor=visitor, user_id=user_id)
        self.db.add(thread)
        await self.db.commit()
        await self.db.refresh(thread)

        return thread

    async def messages(self, thread_id: int) -> list[SupportMessage]:
        """Сообщения переписки по порядку."""

        stmt = select(SupportMessage).where(SupportMessage.thread_id == thread_id).order_by(SupportMessage.id)

        return list((await self.db.scalars(stmt)).all())

    async def count_since(self, thread_id: int, since: datetime) -> int:
        """Сколько сообщений посетитель отправил с момента since."""

        stmt = select(func.count()).where(
            SupportMessage.thread_id == thread_id,
            SupportMessage.from_admin.is_(False),
            SupportMessage.created_at >= since,
        )

        return await self.db.scalar(stmt) or 0

    async def add_message(self, message: SupportMessage) -> SupportMessage:
        """Сохранить сообщение вместе с изменениями переписки."""

        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message, ["photos"])

        return message

    async def mark_read(self, thread: SupportThread, by_admin: bool) -> None:
        """Отметить переписку прочитанной администратором или посетителем."""

        if by_admin:
            thread.unread_for_admin = False
        else:
            thread.unread_for_visitor = 0
        await self.db.commit()

    async def page(self, limit: int, offset: int) -> tuple[list[SupportThread], int]:
        """Переписки для админки: сначала без ответа, потом свежие."""

        stmt = (
            select(SupportThread)
            .order_by(
                SupportThread.unread_for_admin.desc(),
                SupportThread.last_message_at.desc(),
                SupportThread.id.desc(),
            )
            .limit(limit)
            .offset(offset)
        )
        items = list((await self.db.scalars(stmt)).unique().all())
        total = await self.db.scalar(select(func.count()).select_from(SupportThread))

        return items, total or 0

    async def count_unread(self) -> int:
        """Сколько переписок ждут ответа поддержки."""

        stmt = select(func.count()).where(SupportThread.unread_for_admin.is_(True))

        return await self.db.scalar(stmt) or 0
