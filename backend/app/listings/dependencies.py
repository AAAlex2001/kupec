"""Объявления: репозитории, фабрики сценариев, посетитель и загрузка объявления по id из пути."""

import secrets

from fastapi import Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user, require_user
from app.catalog.dependencies import get_category_repository
from app.catalog.services.repo import CategoryRepository
from app.cities.dependencies import get_city_repository
from app.cities.services.repo import CityRepository
from app.core.config import get_settings
from app.core.database import get_session
from app.listings.models import Listing, ListingStatus
from app.listings.services.repo import (
    ListingPhotoRepository,
    ListingRepository,
    ListingViewRepository,
)
from app.listings.services.usecases.count_view import CountViewUseCase
from app.listings.services.usecases.create_listing import CreateListingUseCase
from app.listings.services.usecases.manage_photos import (
    DeleteListingPhotoUseCase,
    UploadListingPhotoUseCase,
)
from app.listings.services.usecases.manage_status import (
    ArchiveListingUseCase,
    DeleteListingUseCase,
    RestoreListingUseCase,
)
from app.listings.services.usecases.update_listing import UpdateListingUseCase
from app.users.models import User

VISITOR_COOKIE = "visitor"
VISITOR_MAX_AGE = 60 * 60 * 24 * 365
VISITOR_TOKEN_MAX_LENGTH = 40


def get_listing_repository(
    session: AsyncSession = Depends(get_session),
) -> ListingRepository:
    """Репозиторий объявлений с сессией текущего запроса."""

    return ListingRepository(session)


def get_photo_repository(
    session: AsyncSession = Depends(get_session),
) -> ListingPhotoRepository:
    """Репозиторий фото объявлений с сессией текущего запроса."""

    return ListingPhotoRepository(session)


def get_create_listing_usecase(
    listings: ListingRepository = Depends(get_listing_repository),
    photos: ListingPhotoRepository = Depends(get_photo_repository),
    categories: CategoryRepository = Depends(get_category_repository),
    cities: CityRepository = Depends(get_city_repository),
) -> CreateListingUseCase:
    """Сценарий размещения объявления."""

    return CreateListingUseCase(listings, photos, categories, cities)


def get_update_listing_usecase(
    listings: ListingRepository = Depends(get_listing_repository),
    photos: ListingPhotoRepository = Depends(get_photo_repository),
    categories: CategoryRepository = Depends(get_category_repository),
    cities: CityRepository = Depends(get_city_repository),
) -> UpdateListingUseCase:
    """Сценарий правки объявления."""

    return UpdateListingUseCase(listings, photos, categories, cities)


def get_upload_photo_usecase(
    photos: ListingPhotoRepository = Depends(get_photo_repository),
) -> UploadListingPhotoUseCase:
    """Сценарий загрузки фото объявления."""

    return UploadListingPhotoUseCase(photos)


def get_delete_photo_usecase(
    photos: ListingPhotoRepository = Depends(get_photo_repository),
) -> DeleteListingPhotoUseCase:
    """Сценарий удаления загруженного фото."""

    return DeleteListingPhotoUseCase(photos)


def get_archive_usecase(
    listings: ListingRepository = Depends(get_listing_repository),
) -> ArchiveListingUseCase:
    """Сценарий снятия объявления с публикации."""

    return ArchiveListingUseCase(listings)


def get_restore_usecase(
    listings: ListingRepository = Depends(get_listing_repository),
) -> RestoreListingUseCase:
    """Сценарий повторной публикации снятого объявления."""

    return RestoreListingUseCase(listings)


def get_delete_listing_usecase(
    listings: ListingRepository = Depends(get_listing_repository),
) -> DeleteListingUseCase:
    """Сценарий удаления объявления."""

    return DeleteListingUseCase(listings)


def get_view_repository(
    session: AsyncSession = Depends(get_session),
) -> ListingViewRepository:
    """Репозиторий просмотров с сессией текущего запроса."""

    return ListingViewRepository(session)


def get_count_view_usecase(
    listings: ListingRepository = Depends(get_listing_repository),
    views: ListingViewRepository = Depends(get_view_repository),
) -> CountViewUseCase:
    """Сценарий подсчёта просмотра."""

    return CountViewUseCase(listings, views)


def get_visitor(
    request: Request,
    response: Response,
    user: User | None = Depends(get_current_user),
) -> str:
    """Кто смотрит: вошедший — по id, гость — по cookie visitor. Новому гостю cookie ставится."""

    if user is not None:
        return f"user:{user.id}"

    token = request.cookies.get(VISITOR_COOKIE)
    if not token or len(token) > VISITOR_TOKEN_MAX_LENGTH:
        token = secrets.token_urlsafe(16)
        response.set_cookie(
            VISITOR_COOKIE,
            token,
            max_age=VISITOR_MAX_AGE,
            httponly=True,
            samesite="lax",
            secure=get_settings().cookie_secure,
            path="/",
        )

    return f"guest:{token}"


async def get_published_listing(
    listing_id: int,
    listings: ListingRepository = Depends(get_listing_repository),
) -> Listing:
    """Опубликованное объявление по id из пути. Иначе — 404."""

    listing = await listings.get_by_id(listing_id)
    if listing is None or listing.status != ListingStatus.PUBLISHED:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Объявление не найдено",
        )

    return listing


async def get_own_listing(
    listing_id: int,
    user: User = Depends(require_user),
    listings: ListingRepository = Depends(get_listing_repository),
) -> Listing:
    """Своё объявление по id из пути. Чужое выглядит как несуществующее — 404."""

    listing = await listings.get_by_id(listing_id)
    if listing is None or listing.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Объявление не найдено",
        )

    return listing
