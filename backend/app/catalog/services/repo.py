"""Репозиторий категорий: только запросы к таблице categories."""

from sqlalchemy import exists, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.catalog.models import Category
from app.listings.models import Listing


class CategoryRepository:
    """Доступ к таблице categories. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, category_id: int) -> Category | None:
        """Категория по id или None."""

        return await self.db.get(Category, category_id)

    async def has_listings(self, category_id: int) -> bool:
        """Есть ли в категории объявления в любом состоянии."""

        stmt = select(exists().where(Listing.category_id == category_id))

        return bool(await self.db.scalar(stmt))

    async def slug_taken(self, slug: str, exclude_id: int | None) -> bool:
        """Занят ли адрес другой категорией."""

        condition = Category.slug == slug
        if exclude_id is not None:
            condition = condition & (Category.id != exclude_id)

        return bool(await self.db.scalar(select(exists().where(condition))))

    async def count_listings(self) -> dict[int, int]:
        """Сколько объявлений в каждой категории, во всех состояниях."""

        stmt = (
            select(Listing.category_id, func.count())
            .where(Listing.category_id.is_not(None))
            .group_by(Listing.category_id)
        )
        result = await self.db.execute(stmt)

        return {category_id: count for category_id, count in result.all()}

    async def list_all(self) -> list[Category]:
        """Все категории, со скрытыми, в порядке справочника."""

        stmt = select(Category).order_by(Category.sort_order, Category.name)
        result = await self.db.execute(stmt)

        return list(result.scalars().all())

    async def add(self, category: Category) -> Category:
        """Сохранить новую категорию."""

        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)

        return category

    async def save(self, category: Category) -> Category:
        """Сохранить изменения категории и соседних, если менялся порядок."""

        await self.db.commit()
        await self.db.refresh(category)

        return category

    async def delete(self, category: Category) -> None:
        """Удалить категорию."""

        await self.db.delete(category)
        await self.db.commit()
