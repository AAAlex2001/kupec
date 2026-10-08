"""Избранное: репозиторий и фабрики сценариев."""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.favorites.services.repo import FavoriteRepository
from app.favorites.services.usecases.manage_favorites import (
    AddFavoriteUseCase,
    RemoveFavoriteUseCase,
)
from app.listings.dependencies import get_listing_repository
from app.listings.services.repo import ListingRepository


def get_favorite_repository(
    session: AsyncSession = Depends(get_session),
) -> FavoriteRepository:
    """Репозиторий избранного с сессией текущего запроса."""

    return FavoriteRepository(session)


def get_add_favorite_usecase(
    favorites: FavoriteRepository = Depends(get_favorite_repository),
    listings: ListingRepository = Depends(get_listing_repository),
) -> AddFavoriteUseCase:
    """Сценарий добавления в избранное."""

    return AddFavoriteUseCase(favorites, listings)


def get_remove_favorite_usecase(
    favorites: FavoriteRepository = Depends(get_favorite_repository),
) -> RemoveFavoriteUseCase:
    """Сценарий удаления из избранного."""

    return RemoveFavoriteUseCase(favorites)
