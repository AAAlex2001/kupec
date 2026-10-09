"""Фильтры по атрибутам из адреса страницы: «a.vid=ogurcy,tomaty&a.ves.from=1»."""

from collections.abc import Mapping
from dataclasses import dataclass, field
from math import isfinite
from typing import Any

from app.attributes.models import AttributeType
from app.attributes.services.fields import CategoryField

PREFIX = "a."


@dataclass
class NumberRange:
    """Числовой атрибут в границах «от — до». Пустая граница не ограничивает."""

    slug: str
    low: float | None
    high: float | None


@dataclass
class AttributeFilters:
    """Условия по атрибутам. Внутри группы — любое из значений, группы — все сразу."""

    groups: list[list[dict[str, Any]]] = field(default_factory=list)
    ranges: list[NumberRange] = field(default_factory=list)


def read_number(text: str | None) -> float | None:
    """Число из адреса или None, если его нет или это не число."""

    try:
        value = float(text) if text else None
        return value if value is not None and isfinite(value) else None
    except ValueError:
        return None


def read_choices(params: Mapping[str, str], key: str) -> list[str]:
    """Выбранные варианты из «a.vid=ogurcy,tomaty»."""

    return [choice for choice in (params.get(key) or "").split(",") if choice]


def parse_filters(params: Mapping[str, str], fields: list[CategoryField]) -> AttributeFilters:
    """Условия по атрибутам категории, у которых включены фильтры. Чужие и неверные значения пропускаются."""

    filters = AttributeFilters()

    for category_field in fields:
        attribute = category_field.attribute
        if not attribute.is_filterable:
            continue

        key = f"{PREFIX}{attribute.slug}"
        allowed = {option.value for option in attribute.options}

        if attribute.type == AttributeType.SELECT:
            choices = [choice for choice in read_choices(params, key) if choice in allowed]
            if choices:
                filters.groups.append([{attribute.slug: choice} for choice in choices])

        elif attribute.type == AttributeType.MULTISELECT:
            choices = [choice for choice in read_choices(params, key) if choice in allowed]
            if choices:
                filters.groups.append([{attribute.slug: [choice]} for choice in choices])

        elif attribute.type == AttributeType.BOOLEAN:
            if params.get(key) == "1":
                filters.groups.append([{attribute.slug: True}])

        elif attribute.type == AttributeType.NUMBER:
            low = read_number(params.get(f"{key}.from"))
            high = read_number(params.get(f"{key}.to"))
            if low is not None or high is not None:
                filters.ranges.append(NumberRange(attribute.slug, low, high))

    return filters
