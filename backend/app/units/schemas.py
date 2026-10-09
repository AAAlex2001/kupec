from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.catalog.models import ListingKind

Code = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True, min_length=1, max_length=16, pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$"
    ),
]
Label = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=32)]


class UnitSchema(BaseModel):
    """Единица цены."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID единицы")
    code: str = Field(..., description="Код латиницей, хранится в объявлении")
    label: str = Field(..., description="Подпись: «кг», «банка»")
    kind: ListingKind = Field(..., description="Для товаров или для услуг")


class UnitUpdateSchema(BaseModel):
    """Правка единицы: код и тип не меняются."""

    label: Label = Field(..., description="Подпись")


class UnitCreateSchema(UnitUpdateSchema):
    """Новая единица."""

    code: Code = Field(..., description="Код латиницей")
    kind: ListingKind = Field(..., description="Для товаров или для услуг")


class CategoryUnitsSchema(BaseModel):
    """Единицы категории в админке: свои и полученные от родителя."""

    own: list[UnitSchema] = Field(..., description="Заданы у самой категории")
    inherited: list[UnitSchema] = Field(..., description="Берутся у родителя, если своих нет")
    inherited_from: str | None = Field(None, description="Название родителя, у которого заданы")


class CategoryUnitsUpdateSchema(BaseModel):
    """Свои единицы категории по порядку. Пустой список — брать у родителя."""

    unit_ids: list[int] = Field([], max_length=50)
