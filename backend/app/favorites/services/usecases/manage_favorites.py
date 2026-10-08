"""Сценарии избранного: добавить объявление и убрать его."""

from app.favorites.models import Favorite
from app.favorites.services.repo import FavoriteRepository
from app.listings.models import ListingStatus
from app.listings.services.exceptions import ListingNotFoundError
from app.listings.services.repo import ListingRepository
from app.users.models import User


class AddFavoriteUseCase:
    """Добавить опубликованное объявление в избранное. Повторное добавление ничего не меняет."""

    def __init__(self, favorites: FavoriteRepository, listings: ListingRepository) -> None:
        self.favorites = favorites
        self.listings = listings

    async def execute(self, user: User, listing_id: int) -> None:
        """Сохранить объявление в избранном. Неопубликованное — ListingNotFoundError."""

        listing = await self.listings.get_by_id(listing_id)
        if listing is None or listing.status != ListingStatus.PUBLISHED:
            raise ListingNotFoundError("Объявление не найдено")

        if await self.favorites.get(user.id, listing_id) is not None:
            return

        await self.favorites.add(Favorite(user_id=user.id, listing_id=listing_id))


class RemoveFavoriteUseCase:
    """Убрать объявление из избранного. Если его там нет, ничего не происходит."""

    def __init__(self, favorites: FavoriteRepository) -> None:
        self.favorites = favorites

    async def execute(self, user: User, listing_id: int) -> None:
        """Удалить запись избранного, если она есть."""

        favorite = await self.favorites.get(user.id, listing_id)
        if favorite is not None:
            await self.favorites.delete(favorite)
