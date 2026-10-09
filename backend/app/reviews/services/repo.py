"""Репозитории отзывов: запросы к таблицам reviews и review_photos."""

from sqlalchemy import func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.chats.models import Conversation
from app.listings.models import Listing
from app.reviews.models import Review, ReviewPhoto, ReviewStatus
from app.users.models import User


class ReviewRepository:
    """Доступ к таблице reviews. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, review_id: int) -> Review | None:
        """Отзыв по id или None."""

        return await self.db.get(Review, review_id)

    async def find(self, listing_id: int, author_id: int) -> Review | None:
        """Отзыв автора по объявлению или None."""

        stmt = select(Review).where(Review.listing_id == listing_id, Review.author_id == author_id)
        result = await self.db.execute(stmt)

        return result.unique().scalar_one_or_none()

    async def list_for_author(self, author_id: int, status: str) -> list[Review]:
        """Отзывы автора в одном состоянии, недавно изменённые первыми."""

        stmt = (
            select(Review)
            .where(Review.author_id == author_id, Review.status == status)
            .order_by(Review.updated_at.desc(), Review.id.desc())
        )
        result = await self.db.execute(stmt)

        return list(result.unique().scalars().all())

    async def count_for_author(self, author_id: int) -> dict[str, int]:
        """Сколько отзывов автора в каждом состоянии."""

        stmt = (
            select(Review.status, func.count())
            .where(Review.author_id == author_id)
            .group_by(Review.status)
        )
        result = await self.db.execute(stmt)

        return {status: count for status, count in result.all()}

    async def list_by_status(
        self, status: str, limit: int, offset: int
    ) -> tuple[list[Review], int]:
        """Отзывы в одном состоянии для модерации, старые первыми, и сколько их всего."""

        condition = Review.status == status
        stmt = (
            select(Review)
            .where(condition)
            .order_by(Review.updated_at, Review.id)
            .limit(limit)
            .offset(offset)
        )
        result = await self.db.execute(stmt)
        total = await self.db.scalar(select(func.count()).select_from(Review).where(condition))

        return list(result.unique().scalars().all()), total or 0

    async def count_by_status(self) -> dict[str, int]:
        """Сколько отзывов на сайте в каждом состоянии."""

        stmt = select(Review.status, func.count()).group_by(Review.status)
        result = await self.db.execute(stmt)

        return {status: count for status, count in result.all()}

    async def list_published_for_seller(
        self, seller_id: int, limit: int, offset: int
    ) -> tuple[list[Review], int]:
        """Опубликованные отзывы о продавце, новые первыми, и сколько их всего."""

        conditions = [Review.seller_id == seller_id, Review.status == ReviewStatus.PUBLISHED]
        stmt = (
            select(Review)
            .where(*conditions)
            .order_by(Review.created_at.desc(), Review.id.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.db.execute(stmt)
        total = await self.db.scalar(select(func.count()).select_from(Review).where(*conditions))

        return list(result.unique().scalars().all()), total or 0

    async def list_reviewable_listings(self, user_id: int) -> list[Listing]:
        """Объявления, по которым пользователь переписывался и ещё не оставил отзыв."""

        reviewed = select(Review.listing_id).where(
            Review.author_id == user_id, Review.listing_id.is_not(None)
        )
        stmt = (
            select(Listing)
            .join(Conversation, Conversation.listing_id == Listing.id)
            .where(
                Conversation.buyer_id == user_id,
                Conversation.last_message_at.is_not(None),
                Listing.id.not_in(reviewed),
            )
            .order_by(Conversation.last_message_at.desc())
        )
        result = await self.db.execute(stmt)

        return list(result.unique().scalars().all())

    async def has_conversation(self, listing_id: int, buyer_id: int) -> bool:
        """Писал ли покупатель автору по этому объявлению."""

        stmt = select(Conversation.id).where(
            Conversation.listing_id == listing_id,
            Conversation.buyer_id == buyer_id,
            Conversation.last_message_at.is_not(None),
        )

        return await self.db.scalar(stmt) is not None

    async def refresh_seller_rating(self, seller_id: int) -> None:
        """Пересчитать у продавца среднюю оценку и число опубликованных отзывов."""

        published = [Review.seller_id == seller_id, Review.status == ReviewStatus.PUBLISHED]
        average = select(func.coalesce(func.avg(Review.rating), 0)).where(*published)
        count = select(func.count()).select_from(Review).where(*published)

        await self.db.execute(
            update(User)
            .where(User.id == seller_id)
            .values(rating=average.scalar_subquery(), reviews_count=count.scalar_subquery())
        )
        await self.db.commit()

    async def add(self, review: Review) -> Review:
        """Сохранить новый отзыв вместе с привязкой фото."""

        self.db.add(review)
        await self.db.commit()

        return await self.reload(review.id)

    async def save(self, review: Review) -> Review:
        """Сохранить изменения отзыва."""

        await self.db.commit()

        return await self.reload(review.id)

    async def delete(self, review: Review) -> None:
        """Удалить отзыв вместе с записями о фото."""

        await self.db.delete(review)
        await self.db.commit()

    async def reload(self, review_id: int) -> Review:
        """Перечитать отзыв вместе с объявлением, автором, продавцом и фото."""

        stmt = (
            select(Review)
            .where(Review.id == review_id)
            .execution_options(populate_existing=True)
        )
        result = await self.db.execute(stmt)

        return result.unique().scalar_one()


class ReviewPhotoRepository:
    """Доступ к таблице review_photos. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, photo_id: int) -> ReviewPhoto | None:
        """Фото по id или None."""

        return await self.db.get(ReviewPhoto, photo_id)

    async def count_free(self, owner_id: int) -> int:
        """Сколько фото пользователь загрузил и ещё не привязал к отзыву."""

        stmt = select(func.count()).where(
            ReviewPhoto.owner_id == owner_id, ReviewPhoto.review_id.is_(None)
        )

        return await self.db.scalar(stmt) or 0

    async def list_usable(
        self, owner_id: int, photo_ids: list[int], review_id: int | None
    ) -> list[ReviewPhoto]:
        """Фото пользователя из списка: свободные или уже привязанные к этому отзыву."""

        allowed = ReviewPhoto.review_id.is_(None)
        if review_id is not None:
            allowed = or_(allowed, ReviewPhoto.review_id == review_id)

        stmt = select(ReviewPhoto).where(
            ReviewPhoto.id.in_(photo_ids), ReviewPhoto.owner_id == owner_id, allowed
        )
        result = await self.db.execute(stmt)

        return list(result.scalars().all())

    async def add(self, photo: ReviewPhoto) -> ReviewPhoto:
        """Сохранить загруженное фото."""

        self.db.add(photo)
        await self.db.commit()
        await self.db.refresh(photo)

        return photo

    async def delete(self, photo: ReviewPhoto) -> None:
        """Удалить фото из базы."""

        await self.db.delete(photo)
        await self.db.commit()
