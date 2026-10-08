"""Сценарии управления своими объявлениями: снять, вернуть в публикацию, удалить."""

from datetime import datetime, timezone

from app.core.uploads import remove_image
from app.listings.models import Listing, ListingStatus
from app.listings.services.exceptions import ListingStatusError
from app.listings.services.repo import ListingRepository


class ArchiveListingUseCase:
    """Снять опубликованное объявление: покупатели перестают его видеть."""

    def __init__(self, listings: ListingRepository) -> None:
        self.listings = listings

    async def execute(self, listing: Listing) -> Listing:
        """Вернуть снятое объявление. Снять можно только опубликованное."""

        if listing.status != ListingStatus.PUBLISHED:
            raise ListingStatusError("Снять можно только опубликованное объявление")

        listing.status = ListingStatus.ARCHIVED

        return await self.listings.save(listing)


class RestoreListingUseCase:
    """Снова опубликовать снятое объявление."""

    def __init__(self, listings: ListingRepository) -> None:
        self.listings = listings

    async def execute(self, listing: Listing) -> Listing:
        """Вернуть опубликованное объявление. Вернуть можно только снятое."""

        if listing.status != ListingStatus.ARCHIVED:
            raise ListingStatusError("Опубликовать снова можно только снятое объявление")

        listing.status = ListingStatus.PUBLISHED
        listing.published_at = datetime.now(timezone.utc)

        return await self.listings.save(listing)


class DeleteListingUseCase:
    """Удалить объявление вместе с фото на диске."""

    def __init__(self, listings: ListingRepository) -> None:
        self.listings = listings

    async def execute(self, listing: Listing) -> None:
        """Удалить объявление. Опубликованное сначала нужно снять."""

        if listing.status == ListingStatus.PUBLISHED:
            raise ListingStatusError("Сначала снимите объявление с публикации")

        paths = [photo.path for photo in listing.photos]
        await self.listings.delete(listing)

        for path in paths:
            remove_image(path)
