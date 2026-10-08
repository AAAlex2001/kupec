"""Репозиторий пользователей: только запросы к таблице users."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.users.models import User


class UserRepository:
    """Доступ к таблице users. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, user_id: int) -> User | None:
        """Пользователь по id или None."""

        return await self.db.get(User, user_id)

    async def get_by_email(self, email: str) -> User | None:
        """Пользователь по email или None."""

        result = await self.db.execute(select(User).where(User.email == email))

        return result.scalar_one_or_none()

    async def add(self, user: User) -> User:
        """Сохранить нового пользователя."""

        self.db.add(user)
        await self.db.commit()

        return await self.reload(user.id)

    async def save(self, user: User) -> User:
        """Сохранить изменения пользователя."""

        await self.db.commit()

        return await self.reload(user.id)

    async def reload(self, user_id: int) -> User:
        """Перечитать пользователя из базы после записи вместе с местом."""

        stmt = select(User).where(User.id == user_id).execution_options(populate_existing=True)
        result = await self.db.execute(stmt)

        return result.scalar_one()
