"""Сценарии единиц цены в категории: какие доступны и какие задать."""

from app.catalog.models import Category
from app.catalog.services.tree import CategoryTree
from app.units.models import CategoryUnit, Unit
from app.units.services.exceptions import InvalidUnitError
from app.units.services.repo import UnitRepository


class LoadCategoryUnitsUseCase:
    """Единицы, из которых выбирают в категории. Один-два запроса."""

    def __init__(self, units: UnitRepository) -> None:
        self.units = units

    async def nearest(
        self, tree: CategoryTree, category: Category
    ) -> tuple[Category | None, list[Unit]]:
        """Ближайшая категория вверх по дереву, где заданы единицы, и её единицы. Нигде — (None, [])."""

        path = [category, *reversed(tree.parents_of(category))]
        bindings = await self.units.list_bindings([item.id for item in path])

        for item in path:
            own = [binding.unit for binding in bindings if binding.category_id == item.id]
            if own:
                return item, own

        return None, []

    async def execute(self, tree: CategoryTree, category: Category | None, kind: str) -> list[Unit]:
        """Единицы категории или ближайшего родителя. Нигде не заданы или нет категории — все единицы типа."""

        units = (await self.nearest(tree, category))[1] if category else []

        return units or await self.units.list_by_kind(kind)


class BindUnitsUseCase:
    """Задать свои единицы категории по порядку. Пустой список — брать у родителя."""

    def __init__(self, units: UnitRepository) -> None:
        self.units = units

    async def execute(self, category: Category, unit_ids: list[int]) -> None:
        """Заменить список. Чужой тип или неизвестная единица — InvalidUnitError."""

        if len(set(unit_ids)) != len(unit_ids):
            raise InvalidUnitError("Единица указана дважды")

        found = await self.units.list_by_ids(unit_ids)
        if len(found) != len(unit_ids):
            raise InvalidUnitError("Такой единицы нет")

        if any(unit.kind != category.kind for unit in found):
            raise InvalidUnitError("Единица не подходит к типу категории")

        bindings = [
            CategoryUnit(category_id=category.id, unit_id=unit_id, sort_order=position)
            for position, unit_id in enumerate(unit_ids)
        ]

        await self.units.replace_bindings(category.id, bindings)
