"""Репозиторий подписок: запросы к таблице follows."""

from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.follows.models import Follow


class FollowRepository:
    """Доступ к таблице follows. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def add(self, follower_id: int, author_id: int) -> None:
        """Подписаться. Повторная подписка ничего не меняет."""

        stmt = (
            insert(Follow)
            .values(follower_id=follower_id, author_id=author_id)
            .on_conflict_do_nothing()
        )
        await self.db.execute(stmt)
        await self.db.commit()

    async def remove(self, follower_id: int, author_id: int) -> None:
        """Отписаться."""

        stmt = delete(Follow).where(
            Follow.follower_id == follower_id, Follow.author_id == author_id
        )
        await self.db.execute(stmt)
        await self.db.commit()

    async def following_ids(self, follower_id: int, author_ids: list[int]) -> set[int]:
        """На кого из списка авторов пользователь подписан."""

        stmt = select(Follow.author_id).where(
            Follow.follower_id == follower_id, Follow.author_id.in_(author_ids)
        )
        result = await self.db.execute(stmt)

        return set(result.scalars().all())
