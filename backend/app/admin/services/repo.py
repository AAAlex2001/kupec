"""Запросы админки: все пользователи и все объявления сайта, удаление пользователя."""

from dataclasses import dataclass

from sqlalchemy import ColumnElement, Select, delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.articles.models import ArticleLike
from app.listings.models import Listing, ListingPhoto
from app.posts.models import CommentLike, Post, PostComment, PostLike, PostMedia
from app.reviews.models import Review, ReviewPhoto
from app.users.models import User


@dataclass
class UserTraces:
    """Что остаётся от пользователя вне каскада: файлы на диске и чужие счётчики, которые надо пересчитать."""

    files: list[str]
    liked_posts: list[int]
    reposted_posts: list[int]
    commented_posts: list[int]
    commented_articles: list[int]
    liked_comments: list[int]
    liked_articles: list[int]
    reviewed_sellers: list[int]


class AdminUserRepository:
    """Пользователи для админки. Сессию получает снаружи."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list(
        self, search: str | None, limit: int, offset: int
    ) -> tuple[list[tuple[User, int]], int]:
        """Пользователи с числом объявлений, новые первыми, и сколько их всего под поиском."""

        conditions: list[ColumnElement[bool]] = []
        if search:
            conditions.append(
                or_(
                    User.email.icontains(search, autoescape=True),
                    User.name.icontains(search, autoescape=True),
                )
            )

        listings_count = (
            select(func.count())
            .where(Listing.owner_id == User.id)
            .correlate(User)
            .scalar_subquery()
        )
        stmt = (
            select(User, listings_count)
            .where(*conditions)
            .order_by(User.created_at.desc(), User.id.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.db.execute(stmt)
        total = await self.db.scalar(select(func.count()).select_from(User).where(*conditions))

        return [(user, count) for user, count in result.unique().all()], total or 0

    async def get(self, user_id: int) -> User | None:
        """Пользователь по id или None."""

        return await self.db.get(User, user_id)

    async def traces(self, user: User) -> UserTraces:
        """Файлы пользователя и чужие записи, у которых после его удаления изменятся счётчики."""

        return UserTraces(
            files=[
                *([user.avatar_path] if user.avatar_path else []),
                *await self.ids(select(ListingPhoto.path).where(ListingPhoto.owner_id == user.id)),
                *await self.ids(select(PostMedia.path).where(PostMedia.owner_id == user.id)),
                *await self.ids(select(ReviewPhoto.path).where(ReviewPhoto.owner_id == user.id)),
            ],
            liked_posts=await self.ids(select(PostLike.post_id).where(PostLike.user_id == user.id)),
            reposted_posts=await self.ids(
                select(Post.repost_of_id).where(Post.author_id == user.id, Post.repost_of_id.is_not(None))
            ),
            commented_posts=await self.ids(
                select(PostComment.post_id).where(PostComment.author_id == user.id, PostComment.post_id.is_not(None))
            ),
            commented_articles=await self.ids(
                select(PostComment.article_id).where(
                    PostComment.author_id == user.id, PostComment.article_id.is_not(None)
                )
            ),
            liked_comments=await self.ids(select(CommentLike.comment_id).where(CommentLike.user_id == user.id)),
            liked_articles=await self.ids(select(ArticleLike.article_id).where(ArticleLike.user_id == user.id)),
            reviewed_sellers=await self.ids(select(Review.seller_id).where(Review.author_id == user.id)),
        )

    async def ids(self, stmt: Select) -> list:
        """Значения одной колонки без повторов."""

        return list((await self.db.scalars(stmt.distinct())).all())

    async def delete(self, user_id: int) -> None:
        """Удалить пользователя. Его объявления, посты, отзывы, переписку и лайки база удаляет каскадом."""

        await self.db.execute(delete(User).where(User.id == user_id))
        await self.db.commit()


class AdminListingRepository:
    """Объявления всех пользователей для админки. Сессию получает снаружи."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list(
        self,
        status: str,
        search: str | None,
        owner_id: int | None,
        limit: int,
        offset: int,
    ) -> tuple[list[Listing], int]:
        """Объявления в одном состоянии, недавно изменённые первыми, и сколько их всего."""

        conditions = [Listing.status == status, *self.filters(search, owner_id)]
        stmt = (
            select(Listing)
            .where(*conditions)
            .order_by(Listing.updated_at.desc(), Listing.id.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.db.execute(stmt)
        total = await self.db.scalar(select(func.count()).select_from(Listing).where(*conditions))

        return list(result.unique().scalars().all()), total or 0

    async def count_by_status(self, search: str | None, owner_id: int | None) -> dict[str, int]:
        """Сколько объявлений в каждом состоянии под тем же поиском."""

        stmt = (
            select(Listing.status, func.count())
            .where(*self.filters(search, owner_id))
            .group_by(Listing.status)
        )
        result = await self.db.execute(stmt)

        return {status: count for status, count in result.all()}

    def filters(self, search: str | None, owner_id: int | None) -> list[ColumnElement[bool]]:
        """Условия поиска по названию и по автору."""

        conditions: list[ColumnElement[bool]] = []
        if search:
            conditions.append(Listing.title.icontains(search, autoescape=True))
        if owner_id:
            conditions.append(Listing.owner_id == owner_id)

        return conditions
