"""Общее для размещения и правки объявления: проверка формы и перенос полей."""

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from app.attributes.services.usecases.load_fields import LoadCategoryFieldsUseCase
from app.attributes.services.values import clean_values
from app.catalog.models import Category
from app.catalog.services.repo import CategoryRepository
from app.catalog.services.tree import CategoryTree
from app.cities.services.repo import CityRepository
from app.listings.models import Listing, ListingPhoto, ListingStatus
from app.listings.schemas import ListingCreateSchema
from app.listings.services.exceptions import InvalidListingError
from app.listings.services.repo import ListingPhotoRepository, ListingRepository
from app.listings.services.validators import clean_text, validate_listing
from app.units.services.usecases.category_units import LoadCategoryUnitsUseCase
from app.users.models import User
from app.users.services.exceptions import InvalidPhoneError
from app.users.services.validators import normalize_phone


@dataclass
class CheckedListing:
    """Проверенная форма: фото по порядку, телефон и значения атрибутов."""

    photos: list[ListingPhoto]
    phone: str | None
    attributes: dict[str, Any]


class SaveListingUseCase:
    """Проверить форму объявления и записать её поля в объявление."""

    def __init__(
        self,
        listings: ListingRepository,
        photos: ListingPhotoRepository,
        categories: CategoryRepository,
        cities: CityRepository,
        units: LoadCategoryUnitsUseCase,
        fields: LoadCategoryFieldsUseCase,
    ) -> None:
        self.listings = listings
        self.photos = photos
        self.categories = categories
        self.cities = cities
        self.units = units
        self.fields = fields

    def find_category(self, full: CategoryTree, category_id: int | None) -> Category | None:
        """Видимая категория без подкатегорий, даже скрытых. Иначе — InvalidListingError."""

        if category_id is None:
            return None

        category = full.active().by_id.get(category_id)
        if category is None:
            raise InvalidListingError({"category_id": "Такой категории нет"})

        if full.children_of(category):
            raise InvalidListingError({"category_id": "Выберите подкатегорию"})

        return category

    async def check(
        self, user: User, payload: ListingCreateSchema, listing_id: int | None
    ) -> CheckedListing:
        """Проверенная форма. Ошибки — InvalidListingError по полям."""

        full = CategoryTree(await self.categories.list_all())
        tree = full.active()
        category = self.find_category(full, payload.category_id)

        if payload.city_id is not None and await self.cities.get_by_id(payload.city_id) is None:
            raise InvalidListingError({"city_id": "Такого города нет"})

        photo_ids = list(dict.fromkeys(payload.photo_ids))
        photos = await self.photos.list_usable(user.id, photo_ids, listing_id)
        if len(photos) != len(photo_ids):
            raise InvalidListingError({"photo_ids": "Фото не найдено, загрузите его заново"})

        units = await self.units.execute(tree, category, payload.kind)

        fields = await self.fields.execute(tree, category) if category else []
        attributes, attribute_errors = clean_values(fields, payload.attributes, payload.publish)

        errors = validate_listing(payload, category, units, len(photos)) | attribute_errors
        if errors:
            raise InvalidListingError(errors)

        try:
            phone = normalize_phone(payload.contact_phone)
        except InvalidPhoneError as error:
            raise InvalidListingError({"contact_phone": str(error)}) from error

        by_id = {photo.id: photo for photo in photos}

        return CheckedListing([by_id[photo_id] for photo_id in photo_ids], phone, attributes)

    def fill(self, listing: Listing, payload: ListingCreateSchema, checked: CheckedListing) -> None:
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
        listing.contact_phone = checked.phone
        listing.attributes = checked.attributes

        for position, photo in enumerate(checked.photos):
            photo.sort_order = position
        listing.photos = checked.photos

        if not payload.publish:
            listing.status = ListingStatus.DRAFT
            return

        if listing.status != ListingStatus.PUBLISHED:
            listing.published_at = datetime.now(timezone.utc)
        listing.status = ListingStatus.PUBLISHED
