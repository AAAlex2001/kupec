"""Репозитории комментариев: запросы к таблицам post_comments и comment_likes."""

from sqlalchemy import delete, func, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.posts.models import CommentLike, Post, PostComment


class PostCommentRepository:
    """Доступ к таблице post_comments. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, comment_id: int) -> PostComment | None:
        """Комментарий по id или None."""

        return await self.db.get(PostComment, comment_id)

    async def list_roots(
        self, post_id: int, limit: int, offset: int
    ) -> tuple[list[PostComment], int]:
        """Корневые комментарии поста по порядку написания и сколько их всего."""

        conditions = [PostComment.post_id == post_id, PostComment.parent_id.is_(None)]
        stmt = (
            select(PostComment)
            .where(*conditions)
            .order_by(PostComment.created_at, PostComment.id)
            .limit(limit)
            .offset(offset)
        )
        result = await self.db.execute(stmt)
        total = await self.db.scalar(
            select(func.count()).select_from(PostComment).where(*conditions)
        )

        return list(result.unique().scalars().all()), total or 0

    async def list_replies(self, root_ids: list[int]) -> list[PostComment]:
        """Ответы в ветках этих корневых комментариев по порядку написания."""

        stmt = (
            select(PostComment)
            .where(PostComment.parent_id.in_(root_ids))
            .order_by(PostComment.created_at, PostComment.id)
        )
        result = await self.db.execute(stmt)

        return list(result.unique().scalars().all())

    async def add(self, comment: PostComment) -> PostComment:
        """Сохранить новый комментарий и пересчитать комментарии поста."""

        self.db.add(comment)
        await self.db.commit()
        await self.refresh_post_count(comment.post_id)

        return await self.reload(comment.id)

    async def save(self, comment: PostComment) -> PostComment:
        """Сохранить изменения комментария."""

        await self.db.commit()

        return await self.reload(comment.id)

    async def delete(self, comment: PostComment) -> None:
        """Удалить комментарий вместе с его веткой и пересчитать комментарии поста."""

        post_id = comment.post_id
        await self.db.delete(comment)
        await self.db.commit()
        await self.refresh_post_count(post_id)

    async def refresh_post_count(self, post_id: int) -> None:
        """Пересчитать, сколько комментариев у поста."""

        count = select(func.count()).select_from(PostComment).where(PostComment.post_id == post_id)
        await self.db.execute(
            update(Post).where(Post.id == post_id).values(comments_count=count.scalar_subquery())
        )
        await self.db.commit()

    async def refresh_likes(self, comment_id: int) -> int:
        """Пересчитать лайки комментария и вернуть их число."""

        count = (
            select(func.count()).select_from(CommentLike).where(CommentLike.comment_id == comment_id)
        )
        await self.db.execute(
            update(PostComment)
            .where(PostComment.id == comment_id)
            .values(likes_count=count.scalar_subquery())
        )
        await self.db.commit()

        stmt = select(PostComment.likes_count).where(PostComment.id == comment_id)

        return await self.db.scalar(stmt) or 0

    async def reload(self, comment_id: int) -> PostComment:
        """Перечитать комментарий вместе с автором и тем, кому ответ."""

        stmt = (
            select(PostComment)
            .where(PostComment.id == comment_id)
            .execution_options(populate_existing=True)
        )
        result = await self.db.execute(stmt)

        return result.unique().scalar_one()


class CommentLikeRepository:
    """Доступ к таблице comment_likes. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def add(self, user_id: int, comment_id: int) -> None:
        """Поставить лайк. Повторный лайк ничего не меняет."""

        stmt = (
            insert(CommentLike)
            .values(user_id=user_id, comment_id=comment_id)
            .on_conflict_do_nothing()
        )
        await self.db.execute(stmt)
        await self.db.commit()

    async def remove(self, user_id: int, comment_id: int) -> None:
        """Убрать лайк."""

        stmt = delete(CommentLike).where(
            CommentLike.user_id == user_id, CommentLike.comment_id == comment_id
        )
        await self.db.execute(stmt)
        await self.db.commit()

    async def liked_ids(self, user_id: int, comment_ids: list[int]) -> set[int]:
        """Какие комментарии из списка пользователь лайкнул."""

        stmt = select(CommentLike.comment_id).where(
            CommentLike.user_id == user_id, CommentLike.comment_id.in_(comment_ids)
        )
        result = await self.db.execute(stmt)

        return set(result.scalars().all())
