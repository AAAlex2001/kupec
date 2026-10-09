"""Запросы админки: все пользователи и все объявления сайта."""

from sqlalchemy import ColumnElement, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.listings.models import Listing
from app.users.models import User


class AdminUserRepository:
    """Пользователи для админки. Сессию получает снаружи."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list(
        self, search: str | None, limit: int, offset: int
    ) -> tuple[list[tuple[User, int]], int]:
        """Пользователи с числом объявлений, новые первыми, и сколько их всего под поиском."""

        conditions: list[ColumnElement[bool]] = []
        if search:
            conditions.append(
                or_(
                    User.email.icontains(search, autoescape=True),
                    User.name.icontains(search, autoescape=True),
                )
            )

        listings_count = (
            select(func.count())
            .where(Listing.owner_id == User.id)
            .correlate(User)
            .scalar_subquery()
        )
        stmt = (
            select(User, listings_count)
            .where(*conditions)
            .order_by(User.created_at.desc(), User.id.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.db.execute(stmt)
        total = await self.db.scalar(select(func.count()).select_from(User).where(*conditions))

        return [(user, count) for user, count in result.unique().all()], total or 0

    async def get(self, user_id: int) -> User | None:
        """Пользователь по id или None."""

        return await self.db.get(User, user_id)


class AdminListingRepository:
    """Объявления всех пользователей для админки. Сессию получает снаружи."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list(
        self,
        status: str,
        search: str | None,
        owner_id: int | None,
        limit: int,
        offset: int,
    ) -> tuple[list[Listing], int]:
        """Объявления в одном состоянии, недавно изменённые первыми, и сколько их всего."""

        conditions = [Listing.status == status, *self.filters(search, owner_id)]
        stmt = (
            select(Listing)
            .where(*conditions)
            .order_by(Listing.updated_at.desc(), Listing.id.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.db.execute(stmt)
        total = await self.db.scalar(select(func.count()).select_from(Listing).where(*conditions))

        return list(result.unique().scalars().all()), total or 0

    async def count_by_status(self, search: str | None, owner_id: int | None) -> dict[str, int]:
        """Сколько объявлений в каждом состоянии под тем же поиском."""

        stmt = (
            select(Listing.status, func.count())
            .where(*self.filters(search, owner_id))
            .group_by(Listing.status)
        )
        result = await self.db.execute(stmt)

        return {status: count for status, count in result.all()}

    def filters(self, search: str | None, owner_id: int | None) -> list[ColumnElement[bool]]:
        """Условия поиска по названию и по автору."""

        conditions: list[ColumnElement[bool]] = []
        if search:
            conditions.append(Listing.title.icontains(search, autoescape=True))
        if owner_id:
            conditions.append(Listing.owner_id == owner_id)

        return conditions
