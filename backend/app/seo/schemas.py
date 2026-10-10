from datetime import datetime

from pydantic import BaseModel, Field


class SitemapItemSchema(BaseModel):
    """Страница в карте сайта: id и когда изменена."""

    id: int = Field(..., description="ID")
    updated_at: datetime = Field(..., description="Когда изменена")


class SitemapSchema(BaseModel):
    """Всё, что открыто всем и попадает в карту сайта."""

    listings: list[SitemapItemSchema]
    posts: list[SitemapItemSchema]
    authors: list[int] = Field(..., description="Авторы с публикациями или объявлениями")
