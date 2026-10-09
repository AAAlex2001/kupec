"""Условия выборки ленты объявлений."""

from dataclasses import dataclass, field
from decimal import Decimal
from enum import StrEnum

from app.attributes.services.filters import AttributeFilters


class ListingSort(StrEnum):
    """Порядок ленты."""

    NEW = "new"
    CHEAP = "cheap"
    EXPENSIVE = "expensive"


@dataclass
class ListingFilter:
    """Фильтры ленты. Новый фильтр — новое поле здесь и одно условие в репозитории."""

    kind: str | None = None
    category_ids: list[int] | None = None
    city_id: int | None = None
    owner_id: int | None = None
    exclude_id: int | None = None
    search: str | None = None
    price_from: Decimal | None = None
    price_to: Decimal | None = None
    service_places: list[str] = field(default_factory=list)
    attributes: AttributeFilters = field(default_factory=AttributeFilters)
    sort: ListingSort = ListingSort.NEW
