"""Сценарий новой категории."""

from app.catalog.models import Category
from app.catalog.schemas import CategoryCreateSchema
from app.catalog.services.usecases.save_category import SaveCategoryUseCase


class CreateCategoryUseCase(SaveCategoryUseCase):
    """Добавить категорию в конец уровня. Подкатегория получает тип родителя."""

    async def execute(self, payload: CategoryCreateSchema) -> Category:
        """Вернуть новую категорию. Ошибки — InvalidCategoryError."""

        await self.check_slug(payload.slug, None)
        parent = await self.check_parent(payload.parent_id)

        category = Category(
            parent_id=payload.parent_id,
            kind=parent.kind if parent else payload.kind,
            slug=payload.slug,
            name=payload.name,
            sort_order=self.next_position(payload.parent_id),
            is_active=True,
        )

        return await self.categories.add(category)
