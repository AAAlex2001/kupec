from datetime import datetime
from typing import Annotated, Self

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.articles.models import (
    MAX_ARTICLE_HTML,
    MAX_DESCRIPTION_LENGTH,
    MAX_SEO_DESCRIPTION_LENGTH,
    MAX_SEO_KEYWORDS_LENGTH,
    MAX_SEO_TITLE_LENGTH,
    MAX_SLUG_LENGTH,
    MAX_TITLE_LENGTH,
    Article,
    ArticleSection,
    ArticleStatus,
)

Slug = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        min_length=3,
        max_length=MAX_SLUG_LENGTH,
        pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$",
    ),
]


class ArticleCardSchema(BaseModel):
    """Статья в списке раздела: заголовок, анонс, обложка и дата."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID")
    section: ArticleSection = Field(..., description="Блог или новости")
    slug: str = Field(..., description="Адрес статьи")
    title: str = Field(..., description="Заголовок")
    description: str = Field(..., description="Анонс")
    cover_url: str | None = Field(None, description="Обложка")
    published_at: datetime | None = Field(None, description="Когда опубликована")
    likes_count: int = Field(..., description="Сколько лайков")
    comments_count: int = Field(..., description="Сколько комментариев вместе с ответами")


class ArticleSchema(ArticleCardSchema):
    """Статья целиком: текст, поля для поисковиков и лайк того, кто смотрит."""

    html: str = Field(..., description="Текст в HTML")
    seo_title: str = Field(..., description="Заголовок для поисковиков")
    seo_description: str = Field(..., description="Описание для поисковиков")
    seo_keywords: str = Field(..., description="Ключевые запросы через запятую")
    updated_at: datetime = Field(..., description="Когда изменена")
    liked: bool = Field(False, description="Вы поставили лайк")

    @classmethod
    def for_viewer(cls, article: Article, liked: bool) -> Self:
        """Статья с отметкой лайка того, кто смотрит."""

        return cls.model_validate(article).model_copy(update={"liked": liked})


class AdminArticleSchema(ArticleSchema):
    """Статья для админки: ещё и статус."""

    status: ArticleStatus = Field(..., description="Черновик или опубликована")
    created_at: datetime = Field(..., description="Когда создана")


class ArticlePageSchema(BaseModel):
    """Страница статей раздела."""

    items: list[ArticleCardSchema]
    total: int = Field(..., description="Всего опубликовано")


class AdminArticlePageSchema(BaseModel):
    """Страница статей раздела в админке, с черновиками."""

    items: list[AdminArticleSchema]
    total: int = Field(..., description="Всего в разделе")


class ArticleSaveSchema(BaseModel):
    """Статья из админки: раздел, адрес, тексты и публиковать ли."""

    section: ArticleSection = Field(..., description="Блог или новости")
    slug: Slug = Field(..., description="Адрес латиницей через дефис")
    title: str = Field(..., min_length=3, max_length=MAX_TITLE_LENGTH, description="Заголовок")
    description: str = Field("", max_length=MAX_DESCRIPTION_LENGTH, description="Анонс")
    html: str = Field("", max_length=MAX_ARTICLE_HTML, description="Текст в HTML")
    seo_title: str = Field("", max_length=MAX_SEO_TITLE_LENGTH, description="Заголовок для поисковиков")
    seo_description: str = Field(
        "", max_length=MAX_SEO_DESCRIPTION_LENGTH, description="Описание для поисковиков"
    )
    seo_keywords: str = Field("", max_length=MAX_SEO_KEYWORDS_LENGTH, description="Ключевые запросы")
    publish: bool = Field(..., description="Опубликовать или оставить черновиком")
