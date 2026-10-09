from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.cities.schemas import CitySchema
from app.reviews.models import MAX_REVIEW_LENGTH, MAX_REVIEW_PHOTOS, ReviewStatus


class ReviewSaveSchema(BaseModel):
    """Оценка, текст, анонимность и фото отзыва — при создании и правке."""

    rating: int = Field(..., ge=1, le=5, description="Оценка от 1 до 5")
    text: str | None = Field(None, max_length=MAX_REVIEW_LENGTH, description="Комментарий")
    anonymous: bool = Field(False, description="Не показывать имя автора")
    photo_ids: list[int] = Field([], max_length=MAX_REVIEW_PHOTOS, description="Фото по порядку")


class ReviewCreateSchema(ReviewSaveSchema):
    """Новый отзыв по объявлению."""

    listing_id: int = Field(..., description="Объявление, о котором отзыв")


class ReviewRejectSchema(BaseModel):
    """Причина отклонения отзыва модератором."""

    reason: str = Field(..., min_length=3, max_length=300, description="Причина отклонения")


class ReviewReplySchema(BaseModel):
    """Ответ продавца на отзыв."""

    text: str = Field(..., min_length=1, max_length=MAX_REVIEW_LENGTH, description="Текст ответа")


class ReviewPhotoSchema(BaseModel):
    """Фото к отзыву."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID фото")
    url: str = Field(..., description="Адрес фото")


class ReviewPersonSchema(BaseModel):
    """Продавец, о котором отзыв."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID пользователя")
    name: str | None = Field(None, description="Имя")


class ReviewListingSchema(BaseModel):
    """Объявление, о котором отзыв."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID объявления")
    title: str = Field(..., description="Название")
    cover_url: str | None = Field(None, description="Адрес обложки")
    city: CitySchema | None = Field(None, description="Город")
    address: str | None = Field(None, description="Адрес")


class ReviewSchema(BaseModel):
    """Отзыв целиком."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID отзыва")
    listing: ReviewListingSchema | None = Field(None, description="Объявление. Удалено — null")
    seller: ReviewPersonSchema = Field(..., description="Продавец")
    author_name: str = Field(
        ..., description="Имя автора или «Покупатель». Кто автор анонимного отзыва, не раскрывается"
    )
    rating: int = Field(..., description="Оценка")
    text: str | None = Field(None, description="Комментарий")
    anonymous: bool = Field(..., description="Без имени автора")
    status: ReviewStatus = Field(..., description="На проверке, опубликован или отклонён")
    reject_reason: str | None = Field(None, description="Причина отклонения")
    photos: list[ReviewPhotoSchema] = Field(..., description="Фото")
    reply_text: str | None = Field(None, description="Ответ продавца")
    reply_at: datetime | None = Field(None, description="Когда продавец ответил")
    created_at: datetime = Field(..., description="Когда написан")
    updated_at: datetime = Field(..., description="Когда изменён")


class ReviewCountsSchema(BaseModel):
    """Сколько отзывов в каждом состоянии."""

    pending: int = Field(0, description="На проверке")
    published: int = Field(0, description="Опубликованные")
    rejected: int = Field(0, description="Отклонённые")


class ReviewListSchema(BaseModel):
    """Отзывы на вкладке и счётчики вкладок."""

    items: list[ReviewSchema]
    counts: ReviewCountsSchema


class SellerReviewsSchema(BaseModel):
    """Опубликованные отзывы о продавце и сколько их всего."""

    items: list[ReviewSchema]
    total: int = Field(..., description="Сколько отзывов всего")


class ReviewableListingSchema(BaseModel):
    """Объявление, по которому можно оставить отзыв."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID объявления")
    title: str = Field(..., description="Название")
    cover_url: str | None = Field(None, description="Адрес обложки")
    owner: ReviewPersonSchema = Field(..., description="Продавец")
    city: CitySchema | None = Field(None, description="Город")
