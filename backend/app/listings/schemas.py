from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.catalog.models import ListingKind
from app.catalog.schemas import CategorySchema
from app.cities.schemas import CitySchema
from app.listings.models import MAX_PHOTOS, ListingStatus, ServicePlace
from app.units.schemas import UnitSchema


class OptionSchema(BaseModel):
    """Вариант выбора в форме: код и подпись."""

    code: str = Field(..., description="Код варианта")
    label: str = Field(..., description="Подпись")


class ListingCategoryOptionSchema(CategorySchema):
    """Конечная категория с названием раздела для выбора и поиска в большой форме."""

    parent_name: str = Field("", description="Путь разделов от корня")


class ListingOptionsSchema(BaseModel):
    """Справочники формы размещения одним ответом."""

    categories: list[ListingCategoryOptionSchema]
    units: list[UnitSchema]
    service_places: list[OptionSchema]


class ListingPhotoSchema(BaseModel):
    """Фото объявления."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID фото")
    url: str = Field(..., description="Адрес фото")


class ListingCreateSchema(BaseModel):
    """Новое объявление. publish=false — черновик, обязательных полей меньше."""

    kind: ListingKind = Field(..., description="Товар или услуга")
    publish: bool = Field(False, description="Сразу опубликовать")
    category_id: int | None = Field(None, description="Категория")
    title: str = Field("", max_length=100, description="Название")
    description: str | None = Field(None, max_length=3000, description="Описание")
    price: Decimal | None = Field(
        None, ge=0, le=100_000_000, decimal_places=2, description="Цена в рублях"
    )
    unit: str | None = Field(None, max_length=16, description="Код единицы цены: jar, kg, session")
    city_id: int | None = Field(None, description="Город")
    address: str | None = Field(None, max_length=300, description="Адрес: улица и дом")
    latitude: float | None = Field(None, ge=-90, le=90, description="Широта метки на карте")
    longitude: float | None = Field(None, ge=-180, le=180, description="Долгота метки на карте")
    service_places: list[ServicePlace] = Field([], description="Где оказывают услугу")
    schedule: str | None = Field(None, max_length=200, description="Расписание услуги")
    contact_phone: str | None = Field(None, max_length=32, description="Телефон для связи")
    photo_ids: list[int] = Field([], max_length=MAX_PHOTOS, description="Фото по порядку")
    attributes: dict[str, Any] = Field(
        {}, max_length=100, description="Значения атрибутов категории по их адресам"
    )


class AuthorSchema(BaseModel):
    """Автор объявления."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID пользователя")
    name: str | None = Field(None, description="Имя")
    avatar_url: str | None = Field(None, description="Адрес аватара")
    rating: float = Field(..., description="Средняя оценка в отзывах")
    reviews_count: int = Field(..., description="Сколько опубликованных отзывов")
    created_at: datetime = Field(..., description="Когда зарегистрировался")


class ListingSchema(BaseModel):
    """Объявление целиком."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID объявления")
    kind: ListingKind = Field(..., description="Товар или услуга")
    status: ListingStatus = Field(..., description="Черновик, опубликовано или в архиве")
    category: CategorySchema | None = Field(None, description="Категория")
    title: str = Field(..., description="Название")
    description: str | None = Field(None, description="Описание")
    price: Decimal | None = Field(None, description="Цена в рублях")
    unit: str | None = Field(None, description="Код единицы цены")
    unit_label: str | None = Field(None, description="Единица цены по-русски")
    city: CitySchema | None = Field(None, description="Город")
    address: str | None = Field(None, description="Адрес: улица и дом")
    latitude: float | None = Field(None, description="Широта метки на карте")
    longitude: float | None = Field(None, description="Долгота метки на карте")
    service_places: list[ServicePlace] = Field(..., description="Где оказывают услугу")
    service_place_labels: list[str] = Field(..., description="Места проведения по-русски")
    schedule: str | None = Field(None, description="Расписание услуги")
    contact_phone: str | None = Field(None, description="Телефон для связи")
    attributes: dict[str, Any] = Field(..., description="Значения атрибутов по их адресам")
    photos: list[ListingPhotoSchema] = Field(..., description="Фото, первое — обложка")
    owner: AuthorSchema = Field(..., description="Автор")
    views_count: int = Field(..., description="Сколько раз смотрели")
    created_at: datetime = Field(..., description="Когда создано")
    updated_at: datetime = Field(..., description="Когда изменено")
    published_at: datetime | None = Field(None, description="Когда опубликовано")


class RangeSchema(BaseModel):
    """Наименьшее и наибольшее значение — границы ползунка «от — до»."""

    min: float = Field(..., description="Наименьшее значение")
    max: float = Field(..., description="Наибольшее значение")


class ListingPageSchema(BaseModel):
    """Страница ленты объявлений."""

    items: list[ListingSchema]
    total: int = Field(..., description="Сколько объявлений подходит под фильтр")
    ranges: dict[str, RangeSchema] = Field(
        {}, description="Границы ползунков: «price» и адреса числовых атрибутов. Только по запросу"
    )


class ListingCountsSchema(BaseModel):
    """Сколько объявлений на каждой вкладке."""

    published: int = Field(0, description="Активные")
    draft: int = Field(0, description="Черновики")
    archived: int = Field(0, description="Снятые")


class MyListingsSchema(BaseModel):
    """Свои объявления на одной вкладке и счётчики всех вкладок."""

    items: list[ListingSchema]
    counts: ListingCountsSchema
