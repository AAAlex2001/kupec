"""Общее для размещения и правки объявления: проверка формы и перенос полей."""

from datetime import datetime, timezone

from app.catalog.services.repo import CategoryRepository
from app.cities.services.repo import CityRepository
from app.listings.models import Listing, ListingPhoto, ListingStatus
from app.listings.schemas import ListingCreateSchema
from app.listings.services.exceptions import InvalidListingError
from app.listings.services.repo import ListingPhotoRepository, ListingRepository
from app.listings.services.validators import clean_text, validate_listing
from app.users.models import User
from app.users.services.exceptions import InvalidPhoneError
from app.users.services.validators import normalize_phone


class SaveListingUseCase:
    """Проверить форму объявления и записать её поля в объявление."""

    def __init__(
        self,
        listings: ListingRepository,
        photos: ListingPhotoRepository,
        categories: CategoryRepository,
        cities: CityRepository,
    ) -> None:
        self.listings = listings
        self.photos = photos
        self.categories = categories
        self.cities = cities

    async def check(
        self, user: User, payload: ListingCreateSchema, listing_id: int | None
    ) -> tuple[list[ListingPhoto], str | None]:
        """Фото по порядку из формы и телефон. Ошибки — InvalidListingError по полям."""

        category = None
        if payload.category_id is not None:
            category = await self.categories.get_by_id(payload.category_id)
            if category is None:
                raise InvalidListingError({"category_id": "Такой категории нет"})

        if payload.city_id is not None and await self.cities.get_by_id(payload.city_id) is None:
            raise InvalidListingError({"city_id": "Такого города нет"})

        photo_ids = list(dict.fromkeys(payload.photo_ids))
        photos = await self.photos.list_usable(user.id, photo_ids, listing_id)
        if len(photos) != len(photo_ids):
            raise InvalidListingError({"photo_ids": "Фото не найдено, загрузите его заново"})

        validate_listing(payload, category, len(photos))

        try:
            phone = normalize_phone(payload.contact_phone)
        except InvalidPhoneError as error:
            raise InvalidListingError({"contact_phone": str(error)}) from error

        by_id = {photo.id: photo for photo in photos}

        return [by_id[photo_id] for photo_id in photo_ids], phone

    def fill(
        self,
        listing: Listing,
        payload: ListingCreateSchema,
        photos: list[ListingPhoto],
        phone: str | None,
    ) -> None:
        """Перенести поля формы в объявление. Публикация ставит дату, если её ещё не было."""

        listing.kind = payload.kind
        listing.category_id = payload.category_id
        listing.title = clean_text(payload.title) or ""
        listing.description = clean_text(payload.description)
        listing.price = payload.price
        listing.unit = payload.unit
        listing.city_id = payload.city_id
        listing.address = clean_text(payload.address)
        listing.latitude = payload.latitude
        listing.longitude = payload.longitude
        listing.service_places = list(dict.fromkeys(payload.service_places))
        listing.schedule = clean_text(payload.schedule)
        listing.contact_phone = phone

        for position, photo in enumerate(photos):
            photo.sort_order = position
        listing.photos = photos

        if not payload.publish:
            listing.status = ListingStatus.DRAFT
            return

        if listing.status != ListingStatus.PUBLISHED:
            listing.published_at = datetime.now(timezone.utc)
        listing.status = ListingStatus.PUBLISHED
