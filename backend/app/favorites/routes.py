from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import require_user
from app.favorites.dependencies import (
    get_add_favorite_usecase,
    get_favorite_repository,
    get_remove_favorite_usecase,
)
from app.favorites.services.repo import FavoriteRepository
from app.favorites.services.usecases.manage_favorites import (
    AddFavoriteUseCase,
    RemoveFavoriteUseCase,
)
from app.listings.schemas import ListingSchema
from app.listings.services.exceptions import ListingNotFoundError
from app.users.models import User

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("")
async def list_favorites(
    user: User = Depends(require_user),
    favorites: FavoriteRepository = Depends(get_favorite_repository),
) -> list[ListingSchema]:
    """Опубликованные объявления из избранного, недавно добавленные первыми."""

    items = await favorites.list_listings(user.id)

    return [ListingSchema.model_validate(item) for item in items]


@router.get("/ids")
async def list_favorite_ids(
    user: User = Depends(require_user),
    favorites: FavoriteRepository = Depends(get_favorite_repository),
) -> list[int]:
    """id объявлений в избранном, чтобы отметить сердечки в выдаче."""

    return await favorites.list_listing_ids(user.id)


@router.put("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def add_favorite(
    listing_id: int,
    user: User = Depends(require_user),
    usecase: AddFavoriteUseCase = Depends(get_add_favorite_usecase),
) -> None:
    """Добавить объявление в избранное."""

    try:
        await usecase.execute(user, listing_id)
    except ListingNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    listing_id: int,
    user: User = Depends(require_user),
    usecase: RemoveFavoriteUseCase = Depends(get_remove_favorite_usecase),
) -> None:
    """Убрать объявление из избранного."""

    await usecase.execute(user, listing_id)
