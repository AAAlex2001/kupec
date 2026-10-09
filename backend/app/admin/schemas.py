from datetime import datetime
from typing import Self

from pydantic import BaseModel, ConfigDict, Field

from app.catalog.models import Category
from app.catalog.schemas import CategorySchema
from app.catalog.services.tree import CategoryTree
from app.cities.schemas import CitySchema
from app.listings.schemas import ListingCountsSchema, ListingSchema
from app.reviews.schemas import ReviewCountsSchema, ReviewSchema


class AdminUserSchema(BaseModel):
    """Пользователь в админке."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID пользователя")
    email: str = Field(..., description="Почта")
    name: str | None = Field(None, description="Имя")
    phone: str | None = Field(None, description="Телефон")
    avatar_url: str | None = Field(None, description="Аватар")
    city: CitySchema | None = Field(None, description="Город")
    is_admin: bool = Field(..., description="Администратор")
    rating: float = Field(..., description="Средняя оценка")
    reviews_count: int = Field(..., description="Опубликованных отзывов о нём")
    listings_count: int = Field(0, description="Сколько объявлений")
    created_at: datetime = Field(..., description="Когда зарегистрирован")


class AdminUserPageSchema(BaseModel):
    """Страница списка пользователей."""

    items: list[AdminUserSchema]
    total: int = Field(..., description="Сколько пользователей под поиском")


class AdminListingPageSchema(BaseModel):
    """Объявления на вкладке и счётчики вкладок."""

    items: list[ListingSchema]
    total: int = Field(..., description="Сколько объявлений на вкладке")
    counts: ListingCountsSchema


class AdminReviewPageSchema(BaseModel):
    """Отзывы на вкладке модерации и счётчики вкладок."""

    items: list[ReviewSchema]
    total: int = Field(..., description="Сколько отзывов на вкладке")
    counts: ReviewCountsSchema


class AdminCategorySchema(CategorySchema):
    """Категория в админке: со скрытыми, числом объявлений и всеми подкатегориями."""

    parent_id: int | None = Field(None, description="Родитель")
    is_active: bool = Field(..., description="Показывается на сайте")
    listings_count: int = Field(..., description="Сколько объявлений прямо в этой категории")
    children: list["AdminCategorySchema"] = Field(..., description="Подкатегории")

    @classmethod
    def from_tree(cls, tree: CategoryTree, category: Category, counts: dict[int, int]) -> Self:
        """Ветка дерева от этой категории вниз с числом объявлений."""

        return cls(
            **CategorySchema.model_validate(category).model_dump(),
            parent_id=category.parent_id,
            is_active=category.is_active,
            listings_count=counts.get(category.id, 0),
            children=[cls.from_tree(tree, child, counts) for child in tree.children_of(category)],
        )


class AdminReviewTextSchema(BaseModel):
    """Новый текст отзыва от модератора."""

    text: str | None = Field(None, max_length=2000, description="Текст отзыва")
