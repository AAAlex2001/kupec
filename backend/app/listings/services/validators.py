"""Проверка объявления: что нужно для черновика и что — для публикации."""

from app.catalog.models import Category, ListingKind
from app.listings.models import UNITS_BY_KIND
from app.listings.schemas import ListingCreateSchema
from app.listings.services.exceptions import InvalidListingError

TITLE_MIN_LENGTH = 3


def clean_text(value: str | None) -> str | None:
    """Текст без пробелов по краям. Пустая строка — None."""

    if value is None:
        return None

    return value.strip() or None


def validate_listing(
    payload: ListingCreateSchema, category: Category | None, photos_count: int
) -> None:
    """Собрать ошибки по всем полям сразу. Публикация требует больше полей, чем черновик."""

    errors: dict[str, str] = {}

    if len(clean_text(payload.title) or "") < TITLE_MIN_LENGTH:
        errors["title"] = "Введите название"

    if category is not None and category.kind != payload.kind:
        errors["category_id"] = "Категория не подходит к типу объявления"

    if payload.unit is not None and payload.unit not in UNITS_BY_KIND[payload.kind]:
        errors["unit"] = "Единица не подходит к типу объявления"

    if payload.kind == ListingKind.PRODUCT and payload.service_places:
        errors["service_places"] = "Место проведения указывают только у услуг"

    if payload.publish:
        if category is None:
            errors.setdefault("category_id", "Выберите категорию")

        if clean_text(payload.description) is None:
            errors["description"] = "Добавьте описание"

        if photos_count == 0:
            errors["photo_ids"] = "Добавьте хотя бы одно фото"

        if not payload.price:
            errors["price"] = "Укажите цену больше 0"

        if payload.unit is None:
            errors.setdefault("unit", "Выберите единицу")

        if payload.city_id is None:
            errors["city_id"] = "Выберите город"

        if payload.kind == ListingKind.SERVICE and not payload.service_places:
            errors["service_places"] = "Укажите, где проходит услуга"

    if errors:
        raise InvalidListingError(errors)
