"""Тесты избранного без БД."""

import asyncio

import pytest

from app.catalog.models import ListingKind
from app.favorites.models import Favorite
from app.favorites.services.usecases.manage_favorites import (
    AddFavoriteUseCase,
    RemoveFavoriteUseCase,
)
from app.listings.models import Listing, ListingStatus
from app.listings.services.exceptions import ListingNotFoundError
from app.users.models import User

USER = User(id=1, email="anna@mail.ru", name="Анна")


class FakeListingRepository:
    """Объявления в словаре по id."""

    def __init__(self, listings: list[Listing]) -> None:
        self.items = {listing.id: listing for listing in listings}

    async def get_by_id(self, listing_id: int) -> Listing | None:
        return self.items.get(listing_id)


class FakeFavoriteRepository:
    """Избранное в словаре по паре пользователь–объявление."""

    def __init__(self) -> None:
        self.items: dict[tuple[int, int], Favorite] = {}

    async def get(self, user_id: int, listing_id: int) -> Favorite | None:
        return self.items.get((user_id, listing_id))

    async def add(self, favorite: Favorite) -> None:
        self.items[(favorite.user_id, favorite.listing_id)] = favorite

    async def delete(self, favorite: Favorite) -> None:
        del self.items[(favorite.user_id, favorite.listing_id)]


def make_listing(listing_id: int, status: ListingStatus) -> Listing:
    return Listing(
        id=listing_id, owner_id=2, kind=ListingKind.PRODUCT, title="Огурцы", status=status
    )


def test_published_listing_is_added_once_and_removed() -> None:
    favorites = FakeFavoriteRepository()
    listings = FakeListingRepository([make_listing(5, ListingStatus.PUBLISHED)])
    add = AddFavoriteUseCase(favorites, listings)

    asyncio.run(add.execute(USER, 5))
    asyncio.run(add.execute(USER, 5))
    assert list(favorites.items) == [(USER.id, 5)]

    asyncio.run(RemoveFavoriteUseCase(favorites).execute(USER, 5))
    asyncio.run(RemoveFavoriteUseCase(favorites).execute(USER, 5))
    assert favorites.items == {}


def test_unpublished_or_missing_listing_cannot_be_added() -> None:
    listings = FakeListingRepository([make_listing(5, ListingStatus.DRAFT)])
    add = AddFavoriteUseCase(FakeFavoriteRepository(), listings)

    with pytest.raises(ListingNotFoundError):
        asyncio.run(add.execute(USER, 5))

    with pytest.raises(ListingNotFoundError):
        asyncio.run(add.execute(USER, 99))
