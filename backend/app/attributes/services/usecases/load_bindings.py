"""Сценарий: свои и унаследованные привязки атрибутов категории — для админки."""

from app.attributes.models import CategoryAttribute
from app.attributes.services.repo import AttributeRepository
from app.catalog.models import Category
from app.catalog.services.tree import CategoryTree


class LoadBindingsUseCase:
    """Привязки категории и её родителей. Один запрос."""

    def __init__(self, attributes: AttributeRepository) -> None:
        self.attributes = attributes

    async def execute(
        self, tree: CategoryTree, category: Category
    ) -> tuple[list[CategoryAttribute], list[CategoryAttribute]]:
        """Свои привязки по порядку и унаследованные от корня вниз, без повторов и без своих."""

        parent_ids = [parent.id for parent in tree.parents_of(category)]
        bindings = await self.attributes.list_bindings(parent_ids + [category.id])

        own = sorted(
            (binding for binding in bindings if binding.category_id == category.id),
            key=lambda binding: binding.sort_order,
        )
        own_ids = {binding.attribute_id for binding in own}

        depth = {category_id: index for index, category_id in enumerate(parent_ids)}
        inherited: dict[int, CategoryAttribute] = {}
        parent_bindings = [binding for binding in bindings if binding.category_id in depth]

        for binding in sorted(parent_bindings, key=lambda item: (depth[item.category_id], item.sort_order)):
            if binding.attribute_id not in own_ids:
                inherited[binding.attribute_id] = binding

        return own, list(inherited.values())
