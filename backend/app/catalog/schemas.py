from pydantic import BaseModel, ConfigDict, Field

from app.catalog.models import ListingKind


class CategorySchema(BaseModel):
    """Категория объявлений."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID категории")
    kind: ListingKind = Field(..., description="Для товаров или для услуг")
    slug: str = Field(..., description="Адрес категории")
    name: str = Field(..., description="Название")
