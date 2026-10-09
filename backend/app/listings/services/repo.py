"""Репозитории объявлений: запросы к таблицам listings и listing_photos."""

from dataclasses import replace
from datetime import date
from decimal import Decimal

from sqlalchemy import ColumnElement, Numeric, case, func, literal_column, or_, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.listings.models import Listing, ListingPhoto, ListingStatus, ListingView
from app.listings.services.filters import ListingFilter, ListingSort

SEARCH_VECTOR = literal_column(
    "to_tsvector('russian', coalesce(listings.title, '') || ' ' || coalesce(listings.description, ''))"
)


def escape_like(text: str) -> str:
    """Экранировать % и _ для поиска подстроки через LIKE."""

    return text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def attribute_number(slug: str) -> ColumnElement:
    """Числовое значение атрибута из JSON объявления. Там не число — NULL, а не ошибка."""

    value = Listing.attributes[slug]

    return case((func.jsonb_typeof(value) == "number", value.astext.cast(Numeric)), else_=None)


class ListingRepository:
    """Доступ к таблице listings. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, listing_id: int) -> Listing | None:
        """Объявление по id или None."""

        return await self.db.get(Listing, listing_id)

    async def list_published(
        self, filters: ListingFilter, limit: int, offset: int
    ) -> tuple[list[Listing], int]:
        """Опубликованные объявления в порядке фильтра и сколько их всего под фильтром."""

        conditions = self.conditions(filters)

        listings_stmt = (
            select(Listing)
            .where(*conditions)
            .order_by(*self.ordering(filters.sort))
            .limit(limit)
            .offset(offset)
        )
        count_stmt = select(func.count()).select_from(Listing).where(*conditions)

        result = await self.db.execute(listings_stmt)
        listings = list(result.unique().scalars().all())

        total = await self.db.scalar(count_stmt)
        if total is None:
            total = 0

        return listings, total

    async def value_ranges(
        self, filters: ListingFilter, number_slugs: list[str]
    ) -> dict[str, tuple[Decimal, Decimal]]:
        """Наименьшее и наибольшее значение цены и числовых атрибутов под фильтрами.

        Свои диапазоны «от — до» при этом не учитываются, чтобы ползунок показывал всю выдачу.
        Ключ цены — «price», атрибутов — их адреса. Нет ни одного значения — ключа нет.
        """

        open_filters = replace(
            filters,
            price_from=None,
            price_to=None,
            attributes=replace(filters.attributes, ranges=[]),
        )
        columns = {"price": Listing.price}
        for slug in number_slugs:
            columns[slug] = attribute_number(slug)

        lows = [func.min(column) for column in columns.values()]
        highs = [func.max(column) for column in columns.values()]
        stmt = select(*lows, *highs).where(*self.conditions(open_filters))
        row = (await self.db.execute(stmt)).one()

        count = len(columns)
        ranges = {}
        for index, key in enumerate(columns):
            if row[index] is not None:
                ranges[key] = (row[index], row[index + count])

        return ranges

    def conditions(self, filters: ListingFilter) -> list[ColumnElement[bool]]:
        """Условия WHERE ленты по фильтрам. Пустой фильтр ничего не ограничивает."""

        conditions: list[ColumnElement[bool]] = [Listing.status == ListingStatus.PUBLISHED]

        if filters.kind:
            conditions.append(Listing.kind == filters.kind)

        if filters.category_ids is not None:
            conditions.append(Listing.category_id.in_(filters.category_ids))

        if filters.city_id:
            conditions.append(Listing.city_id == filters.city_id)

        if filters.owner_id:
            conditions.append(Listing.owner_id == filters.owner_id)

        if filters.exclude_id:
            conditions.append(Listing.id != filters.exclude_id)

        if filters.search:
            conditions.append(
                or_(
                    SEARCH_VECTOR.op("@@")(func.websearch_to_tsquery("russian", filters.search)),
                    Listing.title.ilike(f"%{escape_like(filters.search)}%", escape="\\"),
                )
            )

        if filters.price_from is not None:
            conditions.append(Listing.price >= filters.price_from)

        if filters.price_to is not None:
            conditions.append(Listing.price <= filters.price_to)

        if filters.service_places:
            conditions.append(
                or_(*[Listing.service_places.contains([place]) for place in filters.service_places])
            )

        for group in filters.attributes.groups:
            conditions.append(or_(*[Listing.attributes.contains(value) for value in group]))

        for number in filters.attributes.ranges:
            value = attribute_number(number.slug)
            if number.low is not None:
                conditions.append(value >= number.low)
            if number.high is not None:
                conditions.append(value <= number.high)

        return conditions

    def ordering(self, sort: ListingSort) -> list[ColumnElement]:
        """ORDER BY ленты: новые первыми или по цене, объявления без цены — в конце."""

        if sort == ListingSort.CHEAP:
            return [Listing.price.asc().nulls_last(), Listing.id.desc()]

        if sort == ListingSort.EXPENSIVE:
            return [Listing.price.desc().nulls_last(), Listing.id.desc()]

        return [Listing.published_at.desc(), Listing.id.desc()]

    async def list_for_owner(
        self, owner_id: int, status: str, search: str | None
    ) -> list[Listing]:
        """Объявления автора в одном состоянии, недавно изменённые первыми."""

        conditions = [Listing.owner_id == owner_id, Listing.status == status]
        if search:
            conditions.append(Listing.title.icontains(search, autoescape=True))

        stmt = (
            select(Listing)
            .where(*conditions)
            .order_by(Listing.updated_at.desc(), Listing.id.desc())
        )
        result = await self.db.execute(stmt)

        return list(result.unique().scalars().all())

    async def count_by_status(self, owner_id: int) -> dict[str, int]:
        """Сколько объявлений у автора в каждом состоянии."""

        stmt = (
            select(Listing.status, func.count())
            .where(Listing.owner_id == owner_id)
            .group_by(Listing.status)
        )
        result = await self.db.execute(stmt)

        return {status: count for status, count in result.all()}

    async def add_view(self, listing_id: int) -> None:
        """Засчитать просмотр объявления."""

        await self.db.execute(
            update(Listing)
            .where(Listing.id == listing_id)
            .values(views_count=Listing.views_count + 1)
        )
        await self.db.commit()

    async def save(self, listing: Listing) -> Listing:
        """Сохранить изменения объявления."""

        await self.db.commit()

        return await self.reload(listing.id)

    async def delete(self, listing: Listing) -> None:
        """Удалить объявление вместе с записями о фото."""

        await self.db.delete(listing)
        await self.db.commit()

    async def add(self, listing: Listing) -> Listing:
        """Сохранить новое объявление вместе с привязкой фото."""

        self.db.add(listing)
        await self.db.commit()

        return await self.reload(listing.id)

    async def reload(self, listing_id: int) -> Listing:
        """Перечитать объявление из базы вместе с автором, категорией, городом и фото."""

        stmt = (
            select(Listing)
            .where(Listing.id == listing_id)
            .execution_options(populate_existing=True)
        )
        result = await self.db.execute(stmt)

        return result.scalar_one()


class ListingViewRepository:
    """Доступ к таблице listing_views. Коммит — вместе со счётчиком объявления."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def add_once(self, listing_id: int, visitor: str, day: date) -> bool:
        """Записать просмотр за день. False — этот посетитель сегодня уже смотрел."""

        stmt = (
            insert(ListingView)
            .values(listing_id=listing_id, visitor=visitor, viewed_on=day)
            .on_conflict_do_nothing()
        )
        result = await self.db.execute(stmt)

        return result.rowcount == 1


class ListingPhotoRepository:
    """Доступ к таблице listing_photos. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, photo_id: int) -> ListingPhoto | None:
        """Фото по id или None."""

        return await self.db.get(ListingPhoto, photo_id)

    async def count_free(self, owner_id: int) -> int:
        """Сколько фото пользователь загрузил и ещё не привязал к объявлению."""

        stmt = select(func.count()).where(
            ListingPhoto.owner_id == owner_id,
            ListingPhoto.listing_id.is_(None),
        )
        count = await self.db.scalar(stmt)

        return count or 0

    async def list_usable(
        self, owner_id: int, photo_ids: list[int], listing_id: int | None
    ) -> list[ListingPhoto]:
        """Фото пользователя из списка: свободные или уже привязанные к этому объявлению."""

        allowed = ListingPhoto.listing_id.is_(None)
        if listing_id is not None:
            allowed = or_(allowed, ListingPhoto.listing_id == listing_id)

        stmt = select(ListingPhoto).where(
            ListingPhoto.id.in_(photo_ids),
            ListingPhoto.owner_id == owner_id,
            allowed,
        )
        result = await self.db.execute(stmt)

        return list(result.scalars().all())

    async def add(self, photo: ListingPhoto) -> ListingPhoto:
        """Сохранить загруженное фото."""

        self.db.add(photo)
        await self.db.commit()
        await self.db.refresh(photo)

        return photo

    async def delete(self, photo: ListingPhoto) -> None:
        """Удалить фото из базы."""

        await self.db.delete(photo)
        await self.db.commit()
