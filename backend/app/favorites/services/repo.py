"""Репозиторий избранного: запросы к таблице favorites."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.favorites.models import Favorite
from app.listings.models import Listing, ListingStatus


class FavoriteRepository:
    """Доступ к таблице favorites. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get(self, user_id: int, listing_id: int) -> Favorite | None:
        """Запись избранного по пользователю и объявлению или None."""

        return await self.db.get(Favorite, (user_id, listing_id))

    async def list_listing_ids(self, user_id: int) -> list[int]:
        """id всех объявлений в избранном пользователя."""

        stmt = select(Favorite.listing_id).where(Favorite.user_id == user_id)
        result = await self.db.execute(stmt)

        return list(result.scalars().all())

    async def list_listings(self, user_id: int) -> list[Listing]:
        """Опубликованные объявления из избранного, недавно добавленные первыми."""

        stmt = (
            select(Listing)
            .join(Favorite, Favorite.listing_id == Listing.id)
            .where(Favorite.user_id == user_id, Listing.status == ListingStatus.PUBLISHED)
            .order_by(Favorite.created_at.desc())
        )
        result = await self.db.execute(stmt)

        return list(result.unique().scalars().all())

    async def add(self, favorite: Favorite) -> None:
        """Добавить объявление в избранное."""

        self.db.add(favorite)
        await self.db.commit()

    async def delete(self, favorite: Favorite) -> None:
        """Убрать объявление из избранного."""

        await self.db.delete(favorite)
        await self.db.commit()
