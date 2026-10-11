from datetime import date, datetime
from enum import StrEnum

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.uploads import media_url

MAX_ARTICLE_HTML = 100000
MAX_SLUG_LENGTH = 150
MAX_TITLE_LENGTH = 200
MAX_DESCRIPTION_LENGTH = 500
MAX_SEO_TITLE_LENGTH = 120
MAX_SEO_DESCRIPTION_LENGTH = 300
MAX_SEO_KEYWORDS_LENGTH = 500

PUBLISHED_ONLY = text("status = 'published'")


class ArticleSection(StrEnum):
    """Раздел статьи: блог или новости. От него зависит адрес: /blog/… или /news/…"""

    BLOG = "blog"
    NEWS = "news"


class ArticleStatus(StrEnum):
    """Состояние статьи. Читателям и поисковикам виден только опубликованный."""

    DRAFT = "draft"
    PUBLISHED = "published"


class Article(Base):
    """Статья блога или новость: текст из редактора, обложка и поля для поисковиков."""

    __tablename__ = "articles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    section: Mapped[str] = mapped_column(String(16))
    slug: Mapped[str] = mapped_column(String(MAX_SLUG_LENGTH), unique=True)
    title: Mapped[str] = mapped_column(String(MAX_TITLE_LENGTH))
    description: Mapped[str] = mapped_column(String(MAX_DESCRIPTION_LENGTH), default="")
    html: Mapped[str] = mapped_column(Text, default="")
    cover_path: Mapped[str | None] = mapped_column(String(500))

    seo_title: Mapped[str] = mapped_column(String(MAX_SEO_TITLE_LENGTH), default="")
    seo_description: Mapped[str] = mapped_column(String(MAX_SEO_DESCRIPTION_LENGTH), default="")
    seo_keywords: Mapped[str] = mapped_column(String(MAX_SEO_KEYWORDS_LENGTH), default="")

    status: Mapped[str] = mapped_column(String(16), default=ArticleStatus.DRAFT)
    likes_count: Mapped[int] = mapped_column(Integer, default=0)
    comments_count: Mapped[int] = mapped_column(Integer, default=0)
    views_count: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        CheckConstraint("section IN ('blog', 'news')", name="ck_articles_section"),
        CheckConstraint("status IN ('draft', 'published')", name="ck_articles_status"),
        Index(
            "ix_articles_feed",
            section,
            published_at.desc(),
            id.desc(),
            postgresql_where=PUBLISHED_ONLY,
        ),
        Index("ix_articles_admin", section, updated_at.desc(), id.desc()),
    )

    @property
    def cover_url(self) -> str | None:
        """Адрес обложки для сайта."""

        return media_url(self.cover_path)

    @property
    def path(self) -> str:
        """Адрес статьи на сайте: /news/slug или /blog/slug."""

        return f"/{self.section}/{self.slug}"


class ArticleLike(Base):
    """Лайк статьи. Один пользователь — один лайк."""

    __tablename__ = "article_likes"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    article_id: Mapped[int] = mapped_column(
        ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True, index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class ArticleView(Base):
    """Просмотр статьи посетителем за день. Один посетитель — один просмотр в сутки."""

    __tablename__ = "article_views"

    article_id: Mapped[int] = mapped_column(
        ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True
    )
    visitor: Mapped[str] = mapped_column(String(64), primary_key=True)
    viewed_on: Mapped[date] = mapped_column(Date, primary_key=True)
