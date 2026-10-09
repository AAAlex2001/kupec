"""Сценарий: атрибуты, действующие в категории."""

from app.attributes.services.fields import CategoryField, category_fields
from app.attributes.services.repo import AttributeRepository
from app.catalog.models import Category
from app.catalog.services.tree import CategoryTree


class LoadCategoryFieldsUseCase:
    """Атрибуты категории вместе с унаследованными от родителей. Один запрос."""

    def __init__(self, attributes: AttributeRepository) -> None:
        self.attributes = attributes

    async def execute(self, tree: CategoryTree, category: Category) -> list[CategoryField]:
        """Атрибуты от корня к категории в порядке показа."""

        path_ids = [parent.id for parent in tree.parents_of(category)] + [category.id]
        bindings = await self.attributes.list_bindings(path_ids)

        return category_fields(path_ids, bindings)
