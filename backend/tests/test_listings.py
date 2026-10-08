"""Тесты размещения объявлений без БД."""

import asyncio
from decimal import Decimal

import pytest

from app.catalog.models import Category, ListingKind
from app.cities.models import City
from app.listings.models import Listing, ListingPhoto, ListingStatus, ServicePlace, Unit
from app.listings.schemas import ListingCreateSchema
from app.listings.services.exceptions import (
    InvalidListingError,
    ListingStatusError,
    PhotoNotFoundError,
    TooManyPhotosError,
)
from app.listings.services.usecases.create_listing import CreateListingUseCase
from app.listings.services.usecases.update_listing import UpdateListingUseCase
from app.listings.services.usecases.manage_photos import (
    MAX_FREE_PHOTOS,
    DeleteListingPhotoUseCase,
    UploadListingPhotoUseCase,
)
from app.listings.services.usecases.manage_status import (
    ArchiveListingUseCase,
    DeleteListingUseCase,
    RestoreListingUseCase,
)
from app.users.models import User
from tests.fakes import FakeCityRepository

USER = User(id=1, email="anna@mail.ru", name="Анна")
PICKLES = Category(id=1, kind=ListingKind.PRODUCT, slug="pickles", name="Соленья")
MASSAGE = Category(id=2, kind=ListingKind.SERVICE, slug="massage", name="Массаж")
ANGARSK = City(id=3, name="Ангарск")


class FakeCategoryRepository:
    """Категории в словаре по id."""

    def __init__(self) -> None:
        self.items = {category.id: category for category in (PICKLES, MASSAGE)}

    async def get_by_id(self, category_id: int) -> Category | None:
        return self.items.get(category_id)


class FakePhotoRepository:
    """Фото в словаре по id."""

    def __init__(self, photos: list[ListingPhoto]) -> None:
        self.items = {photo.id: photo for photo in photos}

    async def get_by_id(self, photo_id: int) -> ListingPhoto | None:
        return self.items.get(photo_id)

    async def list_usable(
        self, owner_id: int, photo_ids: list[int], listing_id: int | None
    ) -> list[ListingPhoto]:
        return [
            photo
            for photo in self.items.values()
            if photo.id in photo_ids
            and photo.owner_id == owner_id
            and photo.listing_id in (None, listing_id)
        ]

    async def delete(self, photo: ListingPhoto) -> None:
        del self.items[photo.id]

    async def count_free(self, owner_id: int) -> int:
        return sum(
            1
            for photo in self.items.values()
            if photo.owner_id == owner_id and photo.listing_id is None
        )


class FakeListingRepository:
    """Объявления в списке."""

    def __init__(self) -> None:
        self.items: list[Listing] = []

    async def add(self, listing: Listing) -> Listing:
        listing.id = len(self.items) + 1
        self.items.append(listing)

        return listing

    async def save(self, listing: Listing) -> Listing:
        return listing


def make_photos() -> list[ListingPhoto]:
    return [
        ListingPhoto(id=10, owner_id=USER.id, path="listings/a.jpg"),
        ListingPhoto(id=11, owner_id=USER.id, path="listings/b.jpg"),
        ListingPhoto(id=12, owner_id=99, path="listings/c.jpg"),
    ]


def create(photos: list[ListingPhoto] | None = None, **fields) -> Listing:
    usecase = CreateListingUseCase(
        FakeListingRepository(),
        FakePhotoRepository(photos if photos is not None else make_photos()),
        FakeCategoryRepository(),
        FakeCityRepository([ANGARSK]),
    )

    return asyncio.run(usecase.execute(USER, ListingCreateSchema(**fields)))


def ready_product(**changes) -> dict:
    fields = {
        "kind": ListingKind.PRODUCT,
        "publish": True,
        "category_id": PICKLES.id,
        "title": "  Солёные огурцы, банка 1 л ",
        "description": "Без уксуса, с укропом и чесноком.",
        "price": Decimal("450"),
        "unit": Unit.JAR,
        "city_id": ANGARSK.id,
        "photo_ids": [11, 10],
    }
    fields.update(changes)

    return fields


def errors_of(**fields) -> dict[str, str]:
    with pytest.raises(InvalidListingError) as error:
        create(**fields)

    return error.value.errors


def test_publish_saves_listing_with_photos_in_given_order() -> None:
    listing = create(**ready_product(contact_phone="8 999 000-00-00"))

    assert listing.status == ListingStatus.PUBLISHED
    assert listing.published_at is not None
    assert listing.title == "Солёные огурцы, банка 1 л"
    assert [photo.id for photo in listing.photos] == [11, 10]
    assert [photo.sort_order for photo in listing.photos] == [0, 1]
    assert listing.contact_phone == "+79990000000"


def test_draft_needs_only_title() -> None:
    listing = create(kind=ListingKind.PRODUCT, title="Огурцы")

    assert listing.status == ListingStatus.DRAFT
    assert listing.published_at is None


def test_draft_without_title_is_rejected() -> None:
    assert set(errors_of(kind=ListingKind.PRODUCT, title=" ")) == {"title"}


def test_publish_reports_every_missing_field_at_once() -> None:
    errors = errors_of(kind=ListingKind.PRODUCT, publish=True, title="Огурцы")

    assert set(errors) == {"category_id", "description", "photo_ids", "price", "unit", "city_id"}


def test_zero_price_cannot_be_published() -> None:
    assert set(errors_of(**ready_product(price=Decimal("0")))) == {"price"}


def test_category_and_unit_must_match_kind() -> None:
    errors = errors_of(**ready_product(category_id=MASSAGE.id, unit=Unit.SESSION))

    assert set(errors) == {"category_id", "unit"}


def test_service_needs_place_and_product_cannot_have_it() -> None:
    service = ready_product(
        kind=ListingKind.SERVICE, category_id=MASSAGE.id, unit=Unit.SESSION
    )

    assert set(errors_of(**service)) == {"service_places"}
    assert set(errors_of(**ready_product(service_places=[ServicePlace.CLIENT]))) == {
        "service_places"
    }

    listing = create(**service, service_places=[ServicePlace.SPECIALIST, ServicePlace.CLIENT])
    assert listing.service_places == ["specialist", "client"]


def test_foreign_or_attached_photos_are_rejected() -> None:
    assert set(errors_of(**ready_product(photo_ids=[12]))) == {"photo_ids"}

    photos = make_photos()
    photos[0].listing_id = 5
    with pytest.raises(InvalidListingError):
        create(photos, **ready_product(photo_ids=[10]))


def test_unknown_category_or_city_is_rejected() -> None:
    assert set(errors_of(**ready_product(category_id=999))) == {"category_id"}
    assert set(errors_of(**ready_product(city_id=999))) == {"city_id"}


def test_edit_replaces_fields_and_photos_but_keeps_publish_date() -> None:
    photos = make_photos()
    listing = create(photos, **ready_product(photo_ids=[10]))
    photos[0].listing_id = listing.id
    published_at = listing.published_at
    usecase = UpdateListingUseCase(
        FakeListingRepository(),
        FakePhotoRepository(photos),
        FakeCategoryRepository(),
        FakeCityRepository([ANGARSK]),
    )

    changes = ready_product(title="Огурцы малосольные", photo_ids=[11])
    asyncio.run(usecase.execute(USER, listing, ListingCreateSchema(**changes)))

    assert listing.title == "Огурцы малосольные"
    assert [photo.id for photo in listing.photos] == [11]
    assert listing.published_at == published_at


def test_invalid_phone_is_reported_on_its_field() -> None:
    assert set(errors_of(**ready_product(contact_phone="123"))) == {"contact_phone"}


class FakeStatusRepository:
    """Сохраняет и удаляет объявления в памяти."""

    def __init__(self) -> None:
        self.deleted: list[Listing] = []

    async def save(self, listing: Listing) -> Listing:
        return listing

    async def delete(self, listing: Listing) -> None:
        self.deleted.append(listing)


def make_listing(status: ListingStatus) -> Listing:
    return Listing(id=1, owner_id=USER.id, kind=ListingKind.PRODUCT, title="Огурцы", status=status)


def test_published_listing_goes_to_archive_and_back() -> None:
    listings = FakeStatusRepository()
    listing = make_listing(ListingStatus.PUBLISHED)

    asyncio.run(ArchiveListingUseCase(listings).execute(listing))
    assert listing.status == ListingStatus.ARCHIVED

    asyncio.run(RestoreListingUseCase(listings).execute(listing))
    assert listing.status == ListingStatus.PUBLISHED
    assert listing.published_at is not None


def test_status_actions_check_current_state() -> None:
    listings = FakeStatusRepository()

    with pytest.raises(ListingStatusError):
        asyncio.run(ArchiveListingUseCase(listings).execute(make_listing(ListingStatus.DRAFT)))

    with pytest.raises(ListingStatusError):
        asyncio.run(RestoreListingUseCase(listings).execute(make_listing(ListingStatus.DRAFT)))

    with pytest.raises(ListingStatusError):
        asyncio.run(DeleteListingUseCase(listings).execute(make_listing(ListingStatus.PUBLISHED)))

    draft = make_listing(ListingStatus.DRAFT)
    asyncio.run(DeleteListingUseCase(listings).execute(draft))
    assert listings.deleted == [draft]


def test_upload_stops_at_free_photos_limit() -> None:
    photos = FakePhotoRepository(
        [ListingPhoto(id=index, owner_id=USER.id, path="a.jpg") for index in range(MAX_FREE_PHOTOS)]
    )

    with pytest.raises(TooManyPhotosError):
        asyncio.run(UploadListingPhotoUseCase(photos).execute(USER, None))


def test_only_own_unattached_photo_can_be_deleted() -> None:
    photos = FakePhotoRepository(make_photos())
    usecase = DeleteListingPhotoUseCase(photos)

    with pytest.raises(PhotoNotFoundError):
        asyncio.run(usecase.execute(USER, 12))

    asyncio.run(usecase.execute(USER, 10))
    assert 10 not in photos.items
