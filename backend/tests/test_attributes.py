"""Тесты атрибутов без БД: наследование, проверка значений, фильтры и справочник."""

import asyncio

import pytest

from app.attributes.models import Attribute, AttributeOption, AttributeType, CategoryAttribute
from app.attributes.schemas import (
    AttributeCreateSchema,
    AttributeOptionInput,
    AttributeUpdateSchema,
    CategoryAttributeInput,
)
from app.attributes.services.exceptions import InvalidAttributeError
from app.attributes.services.fields import CategoryField, category_fields
from app.attributes.services.filters import parse_filters
from app.attributes.services.usecases.bind_attributes import BindAttributesUseCase
from app.attributes.services.usecases.save_attribute import (
    CreateAttributeUseCase,
    UpdateAttributeUseCase,
)
from app.attributes.services.values import clean_values
from app.catalog.models import Category


def make_attribute(id: int, slug: str, attribute_type: AttributeType, values: tuple = ()) -> Attribute:
    """Атрибут с вариантами по значениям, фильтр включён."""

    return Attribute(
        id=id,
        slug=slug,
        name=slug.capitalize(),
        type=attribute_type,
        is_filterable=True,
        options=[
            AttributeOption(id=index + 1, value=value, label=value.capitalize(), sort_order=index)
            for index, value in enumerate(values)
        ],
    )


WEIGHT = make_attribute(1, "ves", AttributeType.NUMBER)
VARIETY = make_attribute(2, "vid", AttributeType.SELECT, ("ogurcy", "tomaty"))
SPICES = make_attribute(3, "spetsii", AttributeType.MULTISELECT, ("ukrop", "chesnok"))
HOMEMADE = make_attribute(4, "domashnie", AttributeType.BOOLEAN)
NOTE = make_attribute(5, "zametka", AttributeType.TEXT)

FIELDS = [
    CategoryField(WEIGHT, True),
    CategoryField(VARIETY, False),
    CategoryField(SPICES, False),
    CategoryField(HOMEMADE, False),
    CategoryField(NOTE, False),
]


def binding(category_id: int, attribute: Attribute, sort_order: int, required: bool = False):
    """Привязка атрибута к категории."""

    return CategoryAttribute(
        category_id=category_id,
        attribute_id=attribute.id,
        attribute=attribute,
        is_required=required,
        sort_order=sort_order,
    )


class FakeAttributeRepository:
    """Атрибуты в словаре по id, привязки — в списке."""

    def __init__(self, attributes: list[Attribute]) -> None:
        self.items = {attribute.id: attribute for attribute in attributes}
        self.bindings: list[CategoryAttribute] = []

    async def slug_taken(self, slug: str) -> bool:
        return any(attribute.slug == slug for attribute in self.items.values())

    async def list_by_ids(self, attribute_ids: list[int]) -> list[Attribute]:
        return [self.items[id] for id in attribute_ids if id in self.items]

    async def add(self, attribute: Attribute) -> Attribute:
        attribute.id = 100
        return attribute

    async def save(self, attribute: Attribute) -> Attribute:
        return attribute

    async def replace_bindings(self, category_id: int, bindings: list[CategoryAttribute]) -> None:
        self.bindings = bindings


def test_parent_attributes_come_first_and_child_overrides_required() -> None:
    bindings = [
        binding(2, VARIETY, 0),
        binding(1, WEIGHT, 0),
        binding(2, WEIGHT, 1, required=True),
    ]

    fields = category_fields([1, 2], bindings)

    assert [field.attribute.slug for field in fields] == ["ves", "vid"]
    assert fields[0].is_required is True


def test_values_are_checked_by_type() -> None:
    raw = {
        "ves": 3,
        "vid": "ogurcy",
        "spetsii": ["ukrop", "ukrop", "chesnok"],
        "domashnie": True,
        "zametka": "  без уксуса ",
    }

    values, errors = clean_values(FIELDS, raw, publish=True)

    assert errors == {}
    assert values == {
        "ves": 3,
        "vid": "ogurcy",
        "spetsii": ["ukrop", "chesnok"],
        "domashnie": True,
        "zametka": "без уксуса",
    }


@pytest.mark.parametrize("value", [float("nan"), float("inf"), float("-inf"), 10 ** 400], ids=["nan", "inf", "negative-inf", "oversized-integer"])
def test_invalid_attribute_numbers_are_rejected(value):
    values, errors = clean_values(FIELDS, {"ves": value}, publish=False)
    assert "ves" not in values
    assert "attributes.ves" in errors


@pytest.mark.parametrize("raw", [{"vid": {}}, {"spetsii": [{}]}, {"spetsii": [[]]}])
def test_invalid_choice_shapes_return_validation_errors_instead_of_crashing(raw):
    _, errors = clean_values(FIELDS, raw, publish=True)
    assert any(key in errors for key in ("attributes.vid", "attributes.spetsii"))


@pytest.mark.parametrize("value", ["NaN", "Infinity", "-Infinity"])
def test_non_finite_filter_bounds_are_ignored(value):
    filters = parse_filters({"a.ves.from": value, "a.ves.to": value}, FIELDS)
    assert filters.ranges == []


def test_wrong_values_and_missing_required_give_errors_per_field() -> None:
    raw = {"vid": "kapusta", "spetsii": "ukrop", "domashnie": "да", "ves": True}

    values, errors = clean_values(FIELDS, raw, publish=True)

    assert values == {}
    assert set(errors) == {
        "attributes.ves",
        "attributes.vid",
        "attributes.spetsii",
        "attributes.domashnie",
    }


def test_filters_read_only_known_values_of_filterable_attributes() -> None:
    params = {
        "a.vid": "ogurcy,kapusta",
        "a.spetsii": "ukrop",
        "a.domashnie": "1",
        "a.ves.from": "1",
        "a.ves.to": "abc",
        "a.zametka": "что угодно",
    }

    filters = parse_filters(params, FIELDS)

    assert filters.groups == [
        [{"vid": "ogurcy"}],
        [{"spetsii": ["ukrop"]}],
        [{"domashnie": True}],
    ]
    assert [(item.slug, item.low, item.high) for item in filters.ranges] == [("ves", 1.0, None)]


def test_list_attribute_needs_options_and_others_cannot_have_them() -> None:
    usecase = CreateAttributeUseCase(FakeAttributeRepository([]))

    with pytest.raises(InvalidAttributeError):
        asyncio.run(
            usecase.execute(AttributeCreateSchema(slug="sort", name="Сорт", type=AttributeType.SELECT))
        )

    with pytest.raises(InvalidAttributeError):
        asyncio.run(
            usecase.execute(
                AttributeCreateSchema(
                    slug="massa",
                    name="Масса",
                    type=AttributeType.NUMBER,
                    options=[AttributeOptionInput(value="a", label="А")],
                )
            )
        )


def test_editing_options_keeps_values_and_removes_missing() -> None:
    attribute = make_attribute(7, "sort", AttributeType.SELECT, ("antonovka", "ranet"))
    usecase = UpdateAttributeUseCase(FakeAttributeRepository([attribute]))
    payload = AttributeUpdateSchema(
        name="Сорт яблок",
        options=[
            AttributeOptionInput(id=2, value="izmeneno", label="Ранетка"),
            AttributeOptionInput(value="belyy-naliv", label="Белый налив"),
        ],
    )

    asyncio.run(usecase.execute(attribute, payload))

    assert attribute.name == "Сорт яблок"
    assert [(option.value, option.label) for option in attribute.options] == [
        ("ranet", "Ранетка"),
        ("belyy-naliv", "Белый налив"),
    ]


def test_binding_keeps_order_and_rejects_unknown_or_repeated() -> None:
    repository = FakeAttributeRepository([WEIGHT, VARIETY])
    usecase = BindAttributesUseCase(repository)
    category = Category(id=9, slug="solenya", name="Соленья")

    asyncio.run(
        usecase.execute(
            category,
            [
                CategoryAttributeInput(attribute_id=VARIETY.id),
                CategoryAttributeInput(attribute_id=WEIGHT.id, is_required=True),
            ],
        )
    )
    assert [(item.attribute_id, item.sort_order, item.is_required) for item in repository.bindings] == [
        (VARIETY.id, 0, False),
        (WEIGHT.id, 1, True),
    ]

    with pytest.raises(InvalidAttributeError):
        asyncio.run(usecase.execute(category, [CategoryAttributeInput(attribute_id=99)]))

    with pytest.raises(InvalidAttributeError):
        asyncio.run(
            usecase.execute(
                category,
                [
                    CategoryAttributeInput(attribute_id=WEIGHT.id),
                    CategoryAttributeInput(attribute_id=WEIGHT.id),
                ],
            )
        )
