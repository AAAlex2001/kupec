from typing import Annotated, Literal, Self

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.attributes.schemas import CategoryFieldSchema
from app.catalog.models import Category, ListingKind
from app.catalog.services.tree import CategoryTree
from app.units.schemas import UnitSchema

CategorySlug = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True, min_length=2, max_length=100, pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$"
    ),
]
CategoryName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]


class CategorySchema(BaseModel):
    """Категория объявлений."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID категории")
    kind: ListingKind = Field(..., description="Для товаров или для услуг")
    slug: str = Field(..., description="Адрес категории")
    name: str = Field(..., description="Название")
    image_url: str | None = Field(None, description="Картинка для плитки")


class CategoryNodeSchema(CategorySchema):
    """Категория со всеми подкатегориями."""

    children: list["CategoryNodeSchema"] = Field(..., description="Подкатегории")

    @classmethod
    def from_tree(cls, tree: CategoryTree, category: Category) -> Self:
        """Ветка дерева от этой категории вниз."""

        return cls(
            **CategorySchema.model_validate(category).model_dump(),
            children=[cls.from_tree(tree, child) for child in tree.children_of(category)],
        )


class CategoryPageSchema(BaseModel):
    """Категория для каталога и формы: она сама, путь к ней, подкатегории и атрибуты."""

    category: CategorySchema = Field(..., description="Категория")
    parents: list[CategorySchema] = Field(..., description="Родители от корня")
    children: list[CategorySchema] = Field(..., description="Подкатегории")
    fields: list[CategoryFieldSchema] = Field(..., description="Атрибуты с унаследованными")
    units: list[UnitSchema] = Field(..., description="Единицы цены, доступные в категории")


class CategoryCreateSchema(BaseModel):
    """Новая категория из админки. У подкатегории тип берётся от родителя."""

    parent_id: int | None = Field(None, description="Родитель. Пусто — верхний уровень")
    kind: ListingKind = Field(ListingKind.PRODUCT, description="Тип для верхнего уровня")
    slug: CategorySlug = Field(..., description="Адрес латиницей: «solenya»")
    name: CategoryName = Field(..., description="Название")


class CategoryUpdateSchema(BaseModel):
    """Правка категории из админки: название, адрес, место в дереве и видимость."""

    parent_id: int | None = Field(None, description="Родитель. Пусто — верхний уровень")
    slug: CategorySlug = Field(..., description="Адрес латиницей")
    name: CategoryName = Field(..., description="Название")
    is_active: bool = Field(..., description="Показывать на сайте")


class CategoryMoveSchema(BaseModel):
    """Сдвиг категории среди соседних."""

    direction: Literal["up", "down"] = Field(..., description="Выше или ниже")
