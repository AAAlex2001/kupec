"""Репозиторий населённых пунктов: только запросы к таблице cities."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.cities.models import City


class CityRepository:
    """Доступ к таблице cities. Справочник только читается."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, city_id: int) -> City | None:
        """Населённый пункт по id или None."""

        return await self.db.get(City, city_id)

    async def search(self, query: str | None, limit: int) -> list[City]:
        """Пункты, чьё название начинается с query. Без query — сначала крупные города."""

        stmt = select(City)
        if query:
            stmt = stmt.where(City.name.istartswith(query, autoescape=True))

        stmt = stmt.order_by(City.sort_order, City.name, City.district).limit(limit)
        result = await self.db.execute(stmt)

        return list(result.scalars().all())
