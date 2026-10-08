"""Репозиторий категорий: только запросы к таблице categories."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.catalog.models import Category


class CategoryRepository:
    """Доступ к таблице categories. Справочник только читается, заполняют его миграции."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, category_id: int) -> Category | None:
        """Категория по id или None."""

        return await self.db.get(Category, category_id)

    async def list_all(self) -> list[Category]:
        """Все категории: сначала товары, потом услуги, внутри — в порядке справочника."""

        stmt = select(Category).order_by(Category.kind, Category.sort_order, Category.name)
        result = await self.db.execute(stmt)

        return list(result.scalars().all())
