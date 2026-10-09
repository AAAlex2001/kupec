from typing import Annotated, Self

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.attributes.models import AttributeType
from app.attributes.services.fields import CategoryField

Slug = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True, min_length=1, max_length=100, pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$"
    ),
]
Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
Unit = Annotated[str, StringConstraints(strip_whitespace=True, max_length=16)]


class AttributeOptionSchema(BaseModel):
    """Вариант значения атрибута-списка."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID варианта")
    value: str = Field(..., description="Значение латиницей, хранится в объявлении")
    label: str = Field(..., description="Подпись")


class AttributeSchema(BaseModel):
    """Атрибут из справочника."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID атрибута")
    slug: str = Field(..., description="Адрес латиницей, ключ значения в объявлении")
    name: str = Field(..., description="Название")
    type: AttributeType = Field(..., description="Тип значения")
    unit: str | None = Field(None, description="Единица: кг, л, шт")
    is_filterable: bool = Field(..., description="Показывать в фильтрах каталога")
    options: list[AttributeOptionSchema] = Field(..., description="Варианты для списков")


class CategoryFieldSchema(AttributeSchema):
    """Атрибут в категории: для формы объявления и фильтров."""

    is_required: bool = Field(..., description="Обязателен при публикации")

    @classmethod
    def from_field(cls, field: CategoryField) -> Self:
        """Схема из атрибута категории."""

        return cls(
            **AttributeSchema.model_validate(field.attribute).model_dump(),
            is_required=field.is_required,
        )


class AttributeOptionInput(BaseModel):
    """Вариант в форме атрибута. У нового id нет, у существующего значение не меняется."""

    id: int | None = Field(None, description="ID существующего варианта")
    value: Slug = Field(..., description="Значение латиницей")
    label: Name = Field(..., description="Подпись")


class AttributeUpdateSchema(BaseModel):
    """Правка атрибута: адрес и тип не меняются, варианты заменяются списком целиком."""

    name: Name = Field(..., description="Название")
    unit: Unit | None = Field(None, description="Единица")
    is_filterable: bool = Field(True, description="Показывать в фильтрах")
    options: list[AttributeOptionInput] = Field([], max_length=200, description="Варианты")


class AttributeCreateSchema(AttributeUpdateSchema):
    """Новый атрибут."""

    slug: Slug = Field(..., description="Адрес латиницей")
    type: AttributeType = Field(..., description="Тип значения")


class CategoryAttributeInput(BaseModel):
    """Атрибут, привязанный к категории в админке."""

    attribute_id: int = Field(..., description="ID атрибута")
    is_required: bool = Field(False, description="Обязателен при публикации")


class CategoryAttributesUpdateSchema(BaseModel):
    """Свои атрибуты категории по порядку. Заменяют прежний список целиком."""

    items: list[CategoryAttributeInput] = Field([], max_length=100)


class InheritedFieldSchema(CategoryFieldSchema):
    """Атрибут, который категория получила от родителя."""

    category_name: str = Field(..., description="От какой категории")


class CategoryAttributesSchema(BaseModel):
    """Атрибуты категории в админке: свои и полученные от родителей."""

    own: list[CategoryFieldSchema]
    inherited: list[InheritedFieldSchema]
