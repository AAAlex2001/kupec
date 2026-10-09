"""Сценарий правки категории."""

from app.catalog.models import Category
from app.catalog.schemas import CategoryUpdateSchema
from app.catalog.services.exceptions import InvalidCategoryError
from app.catalog.services.usecases.save_category import SaveCategoryUseCase


class UpdateCategoryUseCase(SaveCategoryUseCase):
    """Изменить название, адрес, видимость и место в дереве."""

    async def execute(self, category: Category, payload: CategoryUpdateSchema) -> Category:
        """Вернуть изменённую категорию. Ошибки — InvalidCategoryError."""

        await self.check_slug(payload.slug, category.id)

        if payload.parent_id != category.parent_id:
            await self.move(category, payload.parent_id)

        category.slug = payload.slug
        category.name = payload.name
        category.is_active = payload.is_active

        return await self.categories.save(category)

    async def move(self, category: Category, parent_id: int | None) -> None:
        """Перенести категорию со всей веткой в конец уровня другого родителя."""

        parent = await self.check_parent(parent_id)

        if parent is not None and parent.id in self.tree.branch_ids(category):
            raise InvalidCategoryError("Нельзя перенести категорию внутрь неё самой")

        if parent is not None and parent.kind != category.kind:
            raise InvalidCategoryError("Нельзя перенести категорию между товарами и услугами")

        category.parent_id = parent_id
        category.sort_order = self.next_position(parent_id)
