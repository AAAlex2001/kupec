"""Репозиторий карты сайта: только id и даты изменения того, что открыто всем."""

from datetime import datetime

from sqlalchemy import select, union
from sqlalchemy.ext.asyncio import AsyncSession

from app.articles.models import Article, ArticleStatus
from app.listings.models import Listing, ListingStatus
from app.posts.models import Post, PostStatus

SITEMAP_LIMIT = 50000


class SitemapRepository:
    """Что попадает в карту сайта. Сессию получает снаружи."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def listings(self) -> list[tuple[int, datetime]]:
        """Опубликованные объявления: id и когда изменены."""

        stmt = (
            select(Listing.id, Listing.updated_at)
            .where(Listing.status == ListingStatus.PUBLISHED)
            .order_by(Listing.id.desc())
            .limit(SITEMAP_LIMIT)
        )
        result = await self.db.execute(stmt)

        return [(row.id, row.updated_at) for row in result.all()]

    async def posts(self) -> list[tuple[int, datetime]]:
        """Опубликованные посты без репостов: id и когда изменены."""

        stmt = (
            select(Post.id, Post.updated_at)
            .where(Post.status == PostStatus.PUBLISHED, Post.repost_of_id.is_(None))
            .order_by(Post.id.desc())
            .limit(SITEMAP_LIMIT)
        )
        result = await self.db.execute(stmt)

        return [(row.id, row.updated_at) for row in result.all()]

    async def articles(self) -> list[tuple[str, datetime]]:
        """Опубликованные статьи блога и новости: адрес и когда изменены."""

        stmt = (
            select(Article)
            .where(Article.status == ArticleStatus.PUBLISHED)
            .order_by(Article.published_at.desc())
            .limit(SITEMAP_LIMIT)
        )
        result = await self.db.execute(stmt)

        return [(article.path, article.updated_at) for article in result.scalars().all()]

    async def authors(self) -> list[int]:
        """Авторы, у которых есть опубликованные объявления или посты."""

        sellers = select(Listing.owner_id).where(Listing.status == ListingStatus.PUBLISHED)
        writers = select(Post.author_id).where(Post.status == PostStatus.PUBLISHED)
        result = await self.db.execute(union(sellers, writers).limit(SITEMAP_LIMIT))

        return [row[0] for row in result.all()]
