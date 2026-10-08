"""Репозитории объявлений: запросы к таблицам listings и listing_photos."""

from datetime import date

from sqlalchemy import ColumnElement, func, or_, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.catalog.models import Category
from app.listings.models import Listing, ListingPhoto, ListingStatus, ListingView


class ListingRepository:
    """Доступ к таблице listings. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, listing_id: int) -> Listing | None:
        """Объявление по id или None."""

        return await self.db.get(Listing, listing_id)

    async def list_published(
        self,
        kind: str | None,
        category_slug: str | None,
        owner_id: int | None,
        exclude_id: int | None,
        limit: int,
        offset: int,
    ) -> tuple[list[Listing], int]:
        """Опубликованные объявления, новые первыми, и сколько их всего под фильтром."""

        conditions: list[ColumnElement[bool]] = [Listing.status == ListingStatus.PUBLISHED]

        if kind:
            conditions.append(Listing.kind == kind)

        if category_slug:
            conditions.append(Listing.category.has(Category.slug == category_slug))

        if owner_id:
            conditions.append(Listing.owner_id == owner_id)

        if exclude_id:
            conditions.append(Listing.id != exclude_id)

        listings_stmt = (
            select(Listing)
            .where(*conditions)
            .order_by(Listing.published_at.desc(), Listing.id.desc())
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
