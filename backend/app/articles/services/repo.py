"""Репозитории статей: запросы к таблицам articles, article_likes и article_views."""

from datetime import date

from sqlalchemy import ColumnElement, delete, func, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.articles.models import Article, ArticleLike, ArticleStatus, ArticleView


class ArticleRepository:
    """Доступ к таблице articles. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, article_id: int) -> Article | None:
        """Статья по id или None."""

        return await self.db.get(Article, article_id)

    async def get_published(self, section: str, slug: str) -> Article | None:
        """Опубликованная статья раздела по адресу или None."""

        stmt = select(Article).where(
            Article.section == section,
            Article.slug == slug,
            Article.status == ArticleStatus.PUBLISHED,
        )

        return await self.db.scalar(stmt)

    async def get_published_by_id(self, article_id: int) -> Article | None:
        """Опубликованная статья по id или None — для лайков и комментариев."""

        article = await self.db.get(Article, article_id)
        if article is None or article.status != ArticleStatus.PUBLISHED:
            return None

        return article

    async def refresh_likes(self, article_id: int) -> int:
        """Пересчитать лайки статьи и вернуть их число."""

        count = select(func.count()).where(ArticleLike.article_id == article_id).scalar_subquery()
        await self.db.execute(
            update(Article).where(Article.id == article_id).values(likes_count=count)
        )
        await self.db.commit()

        return await self.db.scalar(select(Article.likes_count).where(Article.id == article_id)) or 0

    async def add_view(self, article_id: int) -> None:
        """Засчитать просмотр статьи."""

        await self.db.execute(
            update(Article)
            .where(Article.id == article_id)
            .values(views_count=Article.views_count + 1)
        )
        await self.db.commit()

    async def list_published(
        self, section: str, limit: int, offset: int
    ) -> tuple[list[Article], int]:
        """Опубликованные статьи раздела, новые первыми, и сколько их всего."""

        conditions = [Article.section == section, Article.status == ArticleStatus.PUBLISHED]
        order = [Article.published_at.desc(), Article.id.desc()]

        return await self.page(conditions, order, limit, offset)

    async def list_for_admin(
        self, section: str, limit: int, offset: int
    ) -> tuple[list[Article], int]:
        """Все статьи раздела с черновиками, недавно изменённые первыми."""

        conditions = [Article.section == section]
        order = [Article.updated_at.desc(), Article.id.desc()]

        return await self.page(conditions, order, limit, offset)

    async def page(
        self,
        conditions: list[ColumnElement[bool]],
        order: list[ColumnElement],
        limit: int,
        offset: int,
    ) -> tuple[list[Article], int]:
        """Страница статей по условиям и сколько их всего."""

        stmt = select(Article).where(*conditions).order_by(*order).limit(limit).offset(offset)
        items = list((await self.db.execute(stmt)).scalars().all())
        total = await self.db.scalar(select(func.count()).select_from(Article).where(*conditions))

        return items, total or 0

    async def slug_taken(self, slug: str, exclude_id: int | None) -> bool:
        """Занят ли адрес другой статьёй."""

        stmt = select(Article.id).where(Article.slug == slug)
        if exclude_id is not None:
            stmt = stmt.where(Article.id != exclude_id)

        return await self.db.scalar(stmt) is not None

    async def add(self, article: Article) -> Article:
        """Сохранить новую статью."""

        self.db.add(article)
        await self.db.commit()
        await self.db.refresh(article)

        return article

    async def save(self, article: Article) -> Article:
        """Сохранить изменения статьи."""

        await self.db.commit()
        await self.db.refresh(article)

        return article

    async def delete(self, article: Article) -> None:
        """Удалить статью."""

        await self.db.delete(article)
        await self.db.commit()


class ArticleLikeRepository:
    """Доступ к таблице article_likes. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def add(self, user_id: int, article_id: int) -> None:
        """Поставить лайк. Повторный лайк ничего не меняет."""

        stmt = (
            insert(ArticleLike)
            .values(user_id=user_id, article_id=article_id)
            .on_conflict_do_nothing()
        )
        await self.db.execute(stmt)
        await self.db.commit()

    async def remove(self, user_id: int, article_id: int) -> None:
        """Убрать лайк."""

        stmt = delete(ArticleLike).where(
            ArticleLike.user_id == user_id, ArticleLike.article_id == article_id
        )
        await self.db.execute(stmt)
        await self.db.commit()

    async def liked(self, user_id: int, article_id: int) -> bool:
        """Поставил ли пользователь лайк статье."""

        return await self.db.get(ArticleLike, (user_id, article_id)) is not None


class ArticleViewRepository:
    """Доступ к таблице article_views. Коммит — вместе со счётчиком статьи."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def add_once(self, article_id: int, visitor: str, day: date) -> bool:
        """Записать просмотр за день. False — этот посетитель сегодня уже смотрел."""

        stmt = (
            insert(ArticleView)
            .values(article_id=article_id, visitor=visitor, viewed_on=day)
            .on_conflict_do_nothing()
        )
        result = await self.db.execute(stmt)

        return result.rowcount == 1
