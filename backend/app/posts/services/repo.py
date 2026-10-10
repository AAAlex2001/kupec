"""Репозитории публикаций: запросы к таблицам posts, post_media, post_likes и post_saves."""

from datetime import datetime

from sqlalchemy import ColumnElement, delete, func, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.follows.models import Follow
from app.listings.models import Listing, ListingStatus
from app.posts.models import Post, PostLike, PostMedia, PostSave, PostStatus


class PostRepository:
    """Доступ к таблице posts. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, post_id: int) -> Post | None:
        """Пост по id или None."""

        return await self.db.get(Post, post_id)

    async def page(
        self, conditions: list[ColumnElement[bool]], limit: int, offset: int
    ) -> tuple[list[Post], int]:
        """Страница постов по условиям, новые первыми, и сколько их всего."""

        newest = func.coalesce(Post.published_at, Post.created_at)
        stmt = (
            select(Post)
            .where(*conditions)
            .order_by(newest.desc(), Post.id.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.db.execute(stmt)
        total = await self.db.scalar(select(func.count()).select_from(Post).where(*conditions))

        return list(result.unique().scalars().all()), total or 0

    async def list_for_author(
        self, author_id: int, status: str, limit: int, offset: int
    ) -> tuple[list[Post], int]:
        """Свои посты в одном состоянии без репостов."""

        conditions = [
            Post.author_id == author_id,
            Post.status == status,
            Post.repost_of_id.is_(None),
        ]

        return await self.page(conditions, limit, offset)

    async def list_by_author(
        self, author_id: int, limit: int, offset: int
    ) -> tuple[list[Post], int]:
        """Опубликованные посты автора без репостов — для его страницы."""

        conditions = [
            Post.author_id == author_id,
            Post.status == PostStatus.PUBLISHED,
            Post.repost_of_id.is_(None),
        ]

        return await self.page(conditions, limit, offset)

    async def list_reposts(
        self, author_id: int, limit: int, offset: int
    ) -> tuple[list[Post], int]:
        """Свои репосты."""

        conditions = [
            Post.author_id == author_id,
            Post.status == PostStatus.PUBLISHED,
            Post.repost_of_id.is_not(None),
        ]

        return await self.page(conditions, limit, offset)

    async def count_for_author(self, author_id: int) -> dict[str, int]:
        """Сколько своих постов в каждом состоянии без репостов."""

        stmt = (
            select(Post.status, func.count())
            .where(Post.author_id == author_id, Post.repost_of_id.is_(None))
            .group_by(Post.status)
        )
        result = await self.db.execute(stmt)

        return {status: count for status, count in result.all()}

    async def list_published(self, limit: int, offset: int) -> tuple[list[Post], int]:
        """Лента «Для вас»: опубликованные посты и репосты всех авторов."""

        return await self.page([Post.status == PostStatus.PUBLISHED], limit, offset)

    async def list_following(
        self, user_id: int, limit: int, offset: int
    ) -> tuple[list[Post], int]:
        """Лента «Подписки»: опубликованные посты и репосты авторов, на которых подписан пользователь."""

        authors = select(Follow.author_id).where(Follow.follower_id == user_id)
        conditions = [Post.status == PostStatus.PUBLISHED, Post.author_id.in_(authors)]

        return await self.page(conditions, limit, offset)

    async def count_following_since(self, user_id: int, since: datetime | None) -> int:
        """Сколько новых постов у авторов из подписок: после since и после подписки на автора.

        Старые посты автора, на которого только что подписались, новыми не считаются.
        """

        conditions = [
            Post.status == PostStatus.PUBLISHED,
            Follow.follower_id == user_id,
            Post.published_at > Follow.created_at,
        ]
        if since is not None:
            conditions.append(Post.published_at > since)

        stmt = (
            select(func.count())
            .select_from(Post)
            .join(Follow, Follow.author_id == Post.author_id)
            .where(*conditions)
        )

        return await self.db.scalar(stmt) or 0

    async def list_saved(
        self, user_id: int, limit: int, offset: int
    ) -> tuple[list[Post], int]:
        """Опубликованные посты из «Сохранённого», недавно сохранённые первыми, и сколько их всего."""

        conditions = [PostSave.user_id == user_id, Post.status == PostStatus.PUBLISHED]
        stmt = (
            select(Post)
            .join(PostSave, PostSave.post_id == Post.id)
            .where(*conditions)
            .order_by(PostSave.created_at.desc(), Post.id.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.db.execute(stmt)
        total = await self.db.scalar(
            select(func.count())
            .select_from(Post)
            .join(PostSave, PostSave.post_id == Post.id)
            .where(*conditions)
        )

        return list(result.unique().scalars().all()), total or 0

    async def list_by_status(
        self, status: str, limit: int, offset: int
    ) -> tuple[list[Post], int]:
        """Посты всех авторов в одном состоянии — для админки."""

        return await self.page([Post.status == status], limit, offset)

    async def count_by_status(self) -> dict[str, int]:
        """Сколько постов на сайте в каждом состоянии."""

        stmt = select(Post.status, func.count()).group_by(Post.status)
        result = await self.db.execute(stmt)

        return {status: count for status, count in result.all()}
    async def list_own_listings(self, owner_id: int, listing_ids: list[int]) -> list[Listing]:
        """Свои опубликованные объявления из списка."""

        stmt = select(Listing).where(
            Listing.id.in_(listing_ids),
            Listing.owner_id == owner_id,
            Listing.status == ListingStatus.PUBLISHED,
        )
        result = await self.db.execute(stmt)

        return list(result.unique().scalars().all())

    async def refresh_likes(self, post_id: int) -> int:
        """Пересчитать лайки поста и вернуть их число."""

        count = select(func.count()).select_from(PostLike).where(PostLike.post_id == post_id)
        await self.db.execute(
            update(Post).where(Post.id == post_id).values(likes_count=count.scalar_subquery())
        )
        await self.db.commit()

        return await self.db.scalar(select(Post.likes_count).where(Post.id == post_id)) or 0

    async def refresh_reposts(self, post_id: int) -> None:
        """Пересчитать, сколько раз пост репостнули."""

        count = select(func.count()).select_from(Post).where(Post.repost_of_id == post_id)
        await self.db.execute(
            update(Post).where(Post.id == post_id).values(reposts_count=count.scalar_subquery())
        )
        await self.db.commit()

    async def add(self, post: Post) -> Post:
        """Сохранить новый пост вместе с файлами и объявлениями."""

        self.db.add(post)
        await self.db.commit()

        return await self.reload(post.id)

    async def save(self, post: Post) -> Post:
        """Сохранить изменения поста."""

        await self.db.commit()

        return await self.reload(post.id)

    async def delete(self, post: Post) -> None:
        """Удалить пост вместе с записями о файлах, лайках и сохранениях."""

        await self.db.delete(post)
        await self.db.commit()

    async def reload(self, post_id: int) -> Post:
        """Перечитать пост вместе с автором, файлами и объявлениями."""

        stmt = select(Post).where(Post.id == post_id).execution_options(populate_existing=True)
        result = await self.db.execute(stmt)

        return result.unique().scalar_one()


class PostMediaRepository:
    """Доступ к таблице post_media. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, media_id: int) -> PostMedia | None:
        """Файл по id или None."""

        return await self.db.get(PostMedia, media_id)

    async def count_free(self, owner_id: int) -> int:
        """Сколько файлов пользователь загрузил и ещё не привязал к посту."""

        stmt = select(func.count()).where(
            PostMedia.owner_id == owner_id, PostMedia.post_id.is_(None)
        )

        return await self.db.scalar(stmt) or 0

    async def list_usable(
        self, owner_id: int, media_ids: list[int], post_id: int | None
    ) -> list[PostMedia]:
        """Файлы пользователя из списка: свободные или уже привязанные к этому посту."""

        allowed = PostMedia.post_id.is_(None)
        if post_id is not None:
            allowed = allowed | (PostMedia.post_id == post_id)

        stmt = select(PostMedia).where(
            PostMedia.id.in_(media_ids), PostMedia.owner_id == owner_id, allowed
        )
        result = await self.db.execute(stmt)

        return list(result.scalars().all())

    async def add(self, media: PostMedia) -> PostMedia:
        """Сохранить загруженный файл."""

        self.db.add(media)
        await self.db.commit()
        await self.db.refresh(media)

        return media

    async def delete(self, media: PostMedia) -> None:
        """Удалить файл из базы."""

        await self.db.delete(media)
        await self.db.commit()


class PostLikeRepository:
    """Доступ к таблице post_likes. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def add(self, user_id: int, post_id: int) -> None:
        """Поставить лайк. Повторный лайк ничего не меняет."""

        stmt = insert(PostLike).values(user_id=user_id, post_id=post_id).on_conflict_do_nothing()
        await self.db.execute(stmt)
        await self.db.commit()

    async def remove(self, user_id: int, post_id: int) -> None:
        """Убрать лайк."""

        stmt = delete(PostLike).where(PostLike.user_id == user_id, PostLike.post_id == post_id)
        await self.db.execute(stmt)
        await self.db.commit()

    async def liked_ids(self, user_id: int, post_ids: list[int]) -> set[int]:
        """Какие посты из списка пользователь лайкнул."""

        stmt = select(PostLike.post_id).where(
            PostLike.user_id == user_id, PostLike.post_id.in_(post_ids)
        )
        result = await self.db.execute(stmt)

        return set(result.scalars().all())


class PostSaveRepository:
    """Доступ к таблице post_saves. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def add(self, user_id: int, post_id: int) -> None:
        """Сохранить пост. Повторное сохранение ничего не меняет."""

        stmt = insert(PostSave).values(user_id=user_id, post_id=post_id).on_conflict_do_nothing()
        await self.db.execute(stmt)
        await self.db.commit()

    async def remove(self, user_id: int, post_id: int) -> None:
        """Убрать пост из сохранённого."""

        stmt = delete(PostSave).where(PostSave.user_id == user_id, PostSave.post_id == post_id)
        await self.db.execute(stmt)
        await self.db.commit()

    async def saved_ids(self, user_id: int, post_ids: list[int]) -> set[int]:
        """Какие посты из списка пользователь сохранил."""

        stmt = select(PostSave.post_id).where(
            PostSave.user_id == user_id, PostSave.post_id.in_(post_ids)
        )
        result = await self.db.execute(stmt)

        return set(result.scalars().all())
