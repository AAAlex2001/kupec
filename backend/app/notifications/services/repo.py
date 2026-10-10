"""Репозиторий уведомлений: запросы к таблице notifications."""

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.notifications.models import Notification


class NotificationRepository:
    """Доступ к таблице notifications. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def exists(self, notification: Notification) -> bool:
        """Есть ли уже такое же уведомление: тот же человек, то же действие, тот же пост или комментарий."""

        stmt = select(Notification.id).where(
            Notification.user_id == notification.user_id,
            Notification.actor_id == notification.actor_id,
            Notification.kind == notification.kind,
            Notification.post_id.is_not_distinct_from(notification.post_id),
            Notification.comment_id.is_not_distinct_from(notification.comment_id),
        )

        return await self.db.scalar(stmt) is not None

    async def add(self, notification: Notification) -> None:
        """Сохранить уведомление."""

        self.db.add(notification)
        await self.db.commit()

    async def list_for_user(
        self, user_id: int, limit: int, offset: int
    ) -> tuple[list[Notification], int]:
        """Уведомления пользователя, новые первыми, и сколько их всего."""

        condition = Notification.user_id == user_id
        stmt = (
            select(Notification)
            .where(condition)
            .order_by(Notification.created_at.desc(), Notification.id.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.db.execute(stmt)
        total = await self.db.scalar(
            select(func.count()).select_from(Notification).where(condition)
        )

        return list(result.unique().scalars().all()), total or 0

    async def count_unread(self, user_id: int) -> int:
        """Сколько непрочитанных уведомлений."""

        stmt = select(func.count()).where(
            Notification.user_id == user_id, Notification.read.is_(False)
        )

        return await self.db.scalar(stmt) or 0

    async def mark_read(self, user_id: int) -> None:
        """Отметить все уведомления пользователя прочитанными."""

        await self.db.execute(
            update(Notification)
            .where(Notification.user_id == user_id, Notification.read.is_(False))
            .values(read=True)
        )
        await self.db.commit()
