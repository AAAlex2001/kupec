"""Репозиторий населённых пунктов: только запросы к таблице cities."""

from sqlalchemy import case, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.cities.models import City


class CityRepository:
    """Доступ к таблице cities. Справочник только читается."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, city_id: int) -> City | None:
        """Населённый пункт по id или None."""

        return await self.db.get(City, city_id)

    async def regions(self) -> list[str]:
        """Регионы, для которых есть населённые пункты."""

        result = await self.db.execute(select(City.region).distinct().order_by(City.region))

        return list(result.scalars().all())

    async def search(
        self, query: str | None, limit: int, region: str | None = None
    ) -> list[City]:
        """Пункты, чьё название начинается с query. Без query — сначала крупные города."""

        stmt = select(City)
        if region:
            stmt = stmt.where(City.region == region)
        if query:
            normalized = query.lower().replace("ё", "е")
            stmt = stmt.where(City.search_name.startswith(normalized, autoescape=True))
            stmt = stmt.order_by(case((City.search_name == normalized, 0), else_=1))

        stmt = stmt.order_by(
            City.sort_order, City.name, City.region, City.district, City.id
        ).limit(limit)
        result = await self.db.execute(stmt)

        return list(result.scalars().all())
