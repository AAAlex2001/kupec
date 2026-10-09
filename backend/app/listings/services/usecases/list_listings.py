"""Сценарий ленты опубликованных объявлений с фильтрами."""

from collections.abc import Mapping
from dataclasses import dataclass
from decimal import Decimal

from app.attributes.models import AttributeType
from app.attributes.services.filters import parse_filters
from app.attributes.services.usecases.load_fields import LoadCategoryFieldsUseCase
from app.catalog.services.tree import CategoryTree
from app.listings.models import Listing
from app.listings.services.filters import ListingFilter
from app.listings.services.repo import ListingRepository


@dataclass
class ListingPage:
    """Страница ленты: объявления, сколько их всего и диапазоны значений для ползунков."""

    items: list[Listing]
    total: int
    ranges: dict[str, tuple[Decimal, Decimal]]


class ListListingsUseCase:
    """Лента только из видимых категорий. В категории — с её подкатегориями и фильтрами атрибутов."""

    def __init__(self, listings: ListingRepository, fields: LoadCategoryFieldsUseCase) -> None:
        self.listings = listings
        self.fields = fields

    async def execute(
        self,
        tree: CategoryTree,
        filters: ListingFilter,
        category_slug: str | None,
        params: Mapping[str, str],
        page: tuple[int, int],
        with_ranges: bool,
    ) -> ListingPage:
        """Объявления под фильтрами. page — (limit, offset), with_ranges — посчитать диапазоны."""

        number_slugs: list[str] = []
        category = tree.find(category_slug) if category_slug else None

        if category is not None:
            category_fields = await self.fields.execute(tree, category)
            filters.category_ids = tree.branch_ids(category)
            filters.attributes = parse_filters(params, category_fields)
            number_slugs = [
                field.attribute.slug
                for field in category_fields
                if field.attribute.type == AttributeType.NUMBER and field.attribute.is_filterable
            ]
        elif category_slug:
            filters.category_ids = []
        else:
            filters.category_ids = list(tree.by_id)

        limit, offset = page
        items, total = await self.listings.list_published(filters, limit, offset)

        ranges = {}
        if with_ranges:
            ranges = await self.listings.value_ranges(filters, number_slugs)

        return ListingPage(items, total, ranges)
