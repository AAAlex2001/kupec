"""Тесты справочника единиц цены без БД."""

import asyncio

import pytest

from app.catalog.models import Category, ListingKind
from app.catalog.services.tree import CategoryTree
from app.units.models import CategoryUnit, Unit
from app.units.schemas import UnitCreateSchema, UnitUpdateSchema
from app.units.services.exceptions import InvalidUnitError, UnitInUseError
from app.units.services.usecases.category_units import BindUnitsUseCase, LoadCategoryUnitsUseCase
from app.units.services.usecases.manage_units import (
    CreateUnitUseCase,
    DeleteUnitUseCase,
    UpdateUnitUseCase,
)
from tests.test_listings import errors_of, ready_product

KG = Unit(id=1, code="kg", label="кг", kind=ListingKind.PRODUCT, sort_order=0)


class FakeUnitRepository:
    """Единицы в списке; в объявлениях указаны коды из used."""

    def __init__(self, used: set[str] | None = None) -> None:
        self.items = [KG]
        self.used = used or set()
        self.deleted: list[Unit] = []

    async def code_taken(self, code: str) -> bool:
        return any(unit.code == code for unit in self.items)

    async def is_used(self, code: str) -> bool:
        return code in self.used

    async def next_position(self, kind: str) -> int:
        return len([unit for unit in self.items if unit.kind == kind])

    async def add(self, unit: Unit) -> Unit:
        self.items.append(unit)
        return unit

    async def save(self, unit: Unit) -> Unit:
        return unit

    async def delete(self, unit: Unit) -> None:
        self.deleted.append(unit)


def test_new_unit_goes_last_in_its_kind_and_code_must_be_free() -> None:
    repository = FakeUnitRepository()
    usecase = CreateUnitUseCase(repository)

    bag = asyncio.run(
        usecase.execute(UnitCreateSchema(code="bag", label="мешок", kind=ListingKind.PRODUCT))
    )
    assert bag.sort_order == 1

    with pytest.raises(InvalidUnitError):
        asyncio.run(
            usecase.execute(UnitCreateSchema(code="kg", label="кило", kind=ListingKind.PRODUCT))
        )


def test_rename_keeps_code() -> None:
    unit = Unit(id=2, code="jar", label="банка", kind=ListingKind.PRODUCT)

    asyncio.run(UpdateUnitUseCase(FakeUnitRepository()).execute(unit, UnitUpdateSchema(label="банка 1 л")))

    assert (unit.code, unit.label) == ("jar", "банка 1 л")


def test_unit_from_listings_cannot_be_deleted() -> None:
    repository = FakeUnitRepository(used={"kg"})
    usecase = DeleteUnitUseCase(repository)

    with pytest.raises(UnitInUseError):
        asyncio.run(usecase.execute(KG))

    free = Unit(id=3, code="pack", label="упаковка", kind=ListingKind.PRODUCT)
    asyncio.run(usecase.execute(free))
    assert repository.deleted == [free]


def test_listing_unit_must_be_from_category_list() -> None:
    assert errors_of(**ready_product(unit="mesok")) == {"unit": "Выберите единицу из списка"}


FOOD = Category(id=1, kind=ListingKind.PRODUCT, slug="food", name="Продукты")
PICKLES = Category(id=2, parent_id=1, kind=ListingKind.PRODUCT, slug="pickles", name="Соленья")
HONEY = Category(id=3, parent_id=1, kind=ListingKind.PRODUCT, slug="honey", name="Мёд")
JAR = Unit(id=2, code="jar", label="банка", kind=ListingKind.PRODUCT)
SESSION = Unit(id=3, code="session", label="сеанс", kind=ListingKind.SERVICE)
TREE = CategoryTree([FOOD, PICKLES, HONEY])


class FakeBindingRepository(FakeUnitRepository):
    """Привязки единиц к категориям в списке."""

    def __init__(self, bindings: list[CategoryUnit]) -> None:
        super().__init__()
        self.bindings = bindings

    async def list_bindings(self, category_ids: list[int]) -> list[CategoryUnit]:
        return [binding for binding in self.bindings if binding.category_id in category_ids]

    async def list_by_kind(self, kind: str) -> list[Unit]:
        return [unit for unit in (KG, JAR, SESSION) if unit.kind == kind]

    async def list_by_ids(self, unit_ids: list[int]) -> list[Unit]:
        return [unit for unit in (KG, JAR, SESSION) if unit.id in unit_ids]

    async def replace_bindings(self, category_id: int, bindings: list[CategoryUnit]) -> None:
        self.bindings = bindings


def test_category_takes_own_units_then_nearest_parent_then_all_of_kind() -> None:
    usecase = LoadCategoryUnitsUseCase(
        FakeBindingRepository(
            [
                CategoryUnit(category_id=FOOD.id, unit=KG, sort_order=0),
                CategoryUnit(category_id=PICKLES.id, unit=JAR, sort_order=0),
            ]
        )
    )

    assert asyncio.run(usecase.execute(TREE, PICKLES, ListingKind.PRODUCT)) == [JAR]
    assert asyncio.run(usecase.execute(TREE, HONEY, ListingKind.PRODUCT)) == [KG]
    assert asyncio.run(usecase.nearest(TREE, HONEY)) == (FOOD, [KG])

    empty = LoadCategoryUnitsUseCase(FakeBindingRepository([]))
    assert asyncio.run(empty.execute(TREE, HONEY, ListingKind.PRODUCT)) == [KG, JAR]


def test_category_gets_only_units_of_its_kind() -> None:
    repository = FakeBindingRepository([])
    usecase = BindUnitsUseCase(repository)

    asyncio.run(usecase.execute(PICKLES, [JAR.id, KG.id]))
    assert [(item.unit_id, item.sort_order) for item in repository.bindings] == [(2, 0), (1, 1)]

    with pytest.raises(InvalidUnitError):
        asyncio.run(usecase.execute(PICKLES, [SESSION.id]))
