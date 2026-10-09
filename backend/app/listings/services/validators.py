"""Проверка объявления: что нужно для черновика и что — для публикации."""

from app.catalog.models import Category, ListingKind
from app.listings.models import ServicePlace
from app.listings.schemas import ListingCreateSchema
from app.units.models import Unit

TITLE_MIN_LENGTH = 3


def parse_places(text: str | None) -> list[str]:
    """Места услуги из «client,online»: только известные, без повторов."""

    known = {place.value for place in ServicePlace}
    places = [place for place in (text or "").split(",") if place in known]

    return list(dict.fromkeys(places))


def clean_text(value: str | None) -> str | None:
    """Текст без пробелов по краям. Пустая строка — None."""

    if value is None:
        return None

    return value.strip() or None


def validate_listing(
    payload: ListingCreateSchema,
    category: Category | None,
    units: list[Unit],
    photos_count: int,
) -> dict[str, str]:
    """Ошибки по всем полям сразу. Публикация требует больше полей, чем черновик.

    units — единицы, доступные в категории объявления или, без категории, в его типе.
    """

    errors: dict[str, str] = {}

    if len(clean_text(payload.title) or "") < TITLE_MIN_LENGTH:
        errors["title"] = "Введите название"

    if category is not None and category.kind != payload.kind:
        errors["category_id"] = "Категория не подходит к типу объявления"

    if payload.unit is not None and payload.unit not in {unit.code for unit in units}:
        errors["unit"] = "Выберите единицу из списка"

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

    return errors
