from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, Request, UploadFile, status

from app.auth.dependencies import get_current_user, require_user
from app.catalog.dependencies import get_category_tree
from app.catalog.models import ListingKind
from app.catalog.schemas import CategorySchema
from app.catalog.services.tree import CategoryTree
from app.core.uploads import UploadError
from app.listings.dependencies import (
    get_archive_usecase,
    get_count_view_usecase,
    get_create_listing_usecase,
    get_delete_listing_usecase,
    get_delete_photo_usecase,
    get_listing_repository,
    get_editable_listing,
    get_list_listings_usecase,
    get_published_listing,
    get_restore_usecase,
    get_update_listing_usecase,
    get_upload_photo_usecase,
    get_visitor,
)
from app.listings.models import SERVICE_PLACE_LABELS, Listing, ListingStatus
from app.listings.schemas import (
    ListingCountsSchema,
    ListingCategoryOptionSchema,
    ListingCreateSchema,
    ListingOptionsSchema,
    ListingPageSchema,
    ListingPhotoSchema,
    ListingSchema,
    MyListingsSchema,
    OptionSchema,
    RangeSchema,
)
from app.listings.services.exceptions import (
    InvalidListingError,
    ListingStatusError,
    PhotoNotFoundError,
    TooManyPhotosError,
)
from app.listings.services.filters import ListingFilter, ListingSort
from app.listings.services.repo import ListingRepository
from app.listings.services.usecases.count_view import CountViewUseCase
from app.listings.services.usecases.create_listing import CreateListingUseCase
from app.listings.services.usecases.list_listings import ListListingsUseCase
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
from app.listings.services.validators import clean_text, parse_places
from app.units.dependencies import get_unit_repository
from app.units.schemas import UnitSchema
from app.units.services.repo import UnitRepository
from app.users.models import User

router = APIRouter(prefix="/listings", tags=["listings"])


@router.get("/options")
async def get_options(
    tree: CategoryTree = Depends(get_category_tree),
    units: UnitRepository = Depends(get_unit_repository),
) -> ListingOptionsSchema:
    """Справочники формы размещения: конечные категории, единицы цены, места проведения услуг."""

    return ListingOptionsSchema(
        categories=[
            ListingCategoryOptionSchema(
                **CategorySchema.model_validate(category).model_dump(),
                parent_name=" / ".join(parent.name for parent in tree.parents_of(category)),
            )
            for category in tree.leaves()
        ],
        units=[UnitSchema.model_validate(unit) for unit in await units.list_all()],
        service_places=[
            OptionSchema(code=place, label=label) for place, label in SERVICE_PLACE_LABELS.items()
        ],
    )


@router.post("/photos", status_code=status.HTTP_201_CREATED)
async def upload_photo(
    file: UploadFile,
    user: User = Depends(require_user),
    usecase: UploadListingPhotoUseCase = Depends(get_upload_photo_usecase),
) -> ListingPhotoSchema:
    """Загрузить фото для будущего объявления. id передаётся в форме при сохранении."""

    try:
        photo = await usecase.execute(user, file)
    except UploadError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error
    except TooManyPhotosError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Слишком много загруженных фото. Сохраните объявление или удалите лишние",
        ) from error

    return ListingPhotoSchema.model_validate(photo)


@router.delete("/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(
    photo_id: int,
    user: User = Depends(require_user),
    usecase: DeleteListingPhotoUseCase = Depends(get_delete_photo_usecase),
) -> None:
    """Удалить загруженное фото, пока объявление не сохранено."""

    try:
        await usecase.execute(user, photo_id)
    except PhotoNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Фото не найдено",
        ) from error


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_listing(
    payload: ListingCreateSchema,
    user: User = Depends(require_user),
    usecase: CreateListingUseCase = Depends(get_create_listing_usecase),
) -> ListingSchema:
    """Разместить объявление или сохранить черновик. Ошибки приходят по каждому полю."""

    try:
        listing = await usecase.execute(user, payload)
    except InvalidListingError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=[
                {"loc": ["body", field], "msg": message}
                for field, message in error.errors.items()
            ],
        ) from error

    return ListingSchema.model_validate(listing)


@router.get("")
async def list_listings(
    request: Request,
    kind: ListingKind | None = Query(None, description="Только товары или только услуги"),
    category: str | None = Query(
        None, max_length=100, description="Адрес категории, вместе с подкатегориями"
    ),
    city: int | None = Query(None, description="Только в этом населённом пункте"),
    owner: int | None = Query(None, description="Только объявления этого автора"),
    exclude: int | None = Query(None, description="Кроме этого объявления"),
    q: str | None = Query(None, max_length=100, description="Поиск по названию и описанию"),
    price_from: Decimal | None = Query(None, ge=0, description="Цена от"),
    price_to: Decimal | None = Query(None, ge=0, description="Цена до"),
    place: str | None = Query(
        None, max_length=100, description="Где оказывают услугу, любое из: «client,online»"
    ),
    sort: ListingSort = Query(ListingSort.NEW, description="Порядок"),
    bounds: bool = Query(False, description="Вернуть границы ползунков цены и чисел"),
    limit: int = Query(12, ge=1, le=50),
    offset: int = Query(0, ge=0),
    tree: CategoryTree = Depends(get_category_tree),
    usecase: ListListingsUseCase = Depends(get_list_listings_usecase),
) -> ListingPageSchema:
    """Лента опубликованных объявлений с фильтрами.

    Фильтры по атрибутам категории приходят как «a.<адрес>=значение» и «a.<адрес>.from/.to».
    """

    filters = ListingFilter(
        kind=kind,
        city_id=city,
        owner_id=owner,
        exclude_id=exclude,
        search=clean_text(q),
        price_from=price_from,
        price_to=price_to,
        service_places=parse_places(place),
        sort=sort,
    )
    page = await usecase.execute(
        tree, filters, category, request.query_params, (limit, offset), bounds
    )

    return ListingPageSchema(
        items=[ListingSchema.model_validate(item) for item in page.items],
        total=page.total,
        ranges={
            key: RangeSchema(min=low, max=high) for key, (low, high) in page.ranges.items()
        },
    )


@router.get("/my")
async def list_my_listings(
    status_filter: ListingStatus = Query(ListingStatus.PUBLISHED, alias="status"),
    q: str | None = Query(None, max_length=100, description="Поиск по названию"),
    user: User = Depends(require_user),
    listings: ListingRepository = Depends(get_listing_repository),
) -> MyListingsSchema:
    """Свои объявления на вкладке «Активные», «Черновики» или «Снятые» и счётчики вкладок."""

    items = await listings.list_for_owner(user.id, status_filter, q.strip() if q else None)
    counts = await listings.count_by_status(user.id)

    return MyListingsSchema(
        items=[ListingSchema.model_validate(item) for item in items],
        counts=ListingCountsSchema(**counts),
    )


@router.get("/{listing_id}")
async def get_listing(
    listing_id: int,
    user: User | None = Depends(get_current_user),
    listings: ListingRepository = Depends(get_listing_repository),
) -> ListingSchema:
    """Объявление. Черновик и снятое видит только автор."""

    listing = await listings.get_by_id(listing_id)
    is_owner = listing is not None and user is not None and listing.owner_id == user.id

    if listing is None or (listing.status != ListingStatus.PUBLISHED and not is_owner):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Объявление не найдено",
        )

    return ListingSchema.model_validate(listing)


@router.post("/{listing_id}/view", status_code=status.HTTP_204_NO_CONTENT)
async def count_view(
    listing: Listing = Depends(get_published_listing),
    visitor: str = Depends(get_visitor),
    user: User | None = Depends(get_current_user),
    usecase: CountViewUseCase = Depends(get_count_view_usecase),
) -> None:
    """Засчитать просмотр. Один посетитель — один просмотр в сутки, автор не считается."""

    await usecase.execute(listing, visitor, user.id if user else None)


@router.put("/{listing_id}")
async def update_listing(
    payload: ListingCreateSchema,
    listing: Listing = Depends(get_editable_listing),
    usecase: UpdateListingUseCase = Depends(get_update_listing_usecase),
) -> ListingSchema:
    """Изменить объявление целиком: автор — своё, админ — любое. Ошибки приходят по полям."""

    try:
        updated = await usecase.execute(listing, payload)
    except InvalidListingError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=[
                {"loc": ["body", field], "msg": message}
                for field, message in error.errors.items()
            ],
        ) from error

    return ListingSchema.model_validate(updated)


@router.post("/{listing_id}/archive")
async def archive_listing(
    listing: Listing = Depends(get_editable_listing),
    usecase: ArchiveListingUseCase = Depends(get_archive_usecase),
) -> ListingSchema:
    """Снять объявление с публикации. Его можно будет опубликовать снова."""

    try:
        archived = await usecase.execute(listing)
    except ListingStatusError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error

    return ListingSchema.model_validate(archived)


@router.post("/{listing_id}/restore")
async def restore_listing(
    listing: Listing = Depends(get_editable_listing),
    usecase: RestoreListingUseCase = Depends(get_restore_usecase),
) -> ListingSchema:
    """Снова опубликовать снятое объявление."""

    try:
        restored = await usecase.execute(listing)
    except ListingStatusError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error

    return ListingSchema.model_validate(restored)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_listing(
    listing: Listing = Depends(get_editable_listing),
    usecase: DeleteListingUseCase = Depends(get_delete_listing_usecase),
) -> None:
    """Удалить черновик или снятое объявление."""

    try:
        await usecase.execute(listing)
    except ListingStatusError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error
