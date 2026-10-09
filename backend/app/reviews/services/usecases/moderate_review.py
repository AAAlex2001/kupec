"""Сценарии модерации отзывов администратором."""

from app.reviews.models import Review, ReviewStatus
from app.reviews.services.repo import ReviewRepository
from app.reviews.services.validators import clean_text


class ApproveReviewUseCase:
    """Опубликовать отзыв: он появится у продавца и попадёт в рейтинг."""

    def __init__(self, reviews: ReviewRepository) -> None:
        self.reviews = reviews

    async def execute(self, review: Review) -> Review:
        """Вернуть опубликованный отзыв."""

        review.status = ReviewStatus.PUBLISHED
        review.reject_reason = None

        saved = await self.reviews.save(review)
        await self.reviews.refresh_seller_rating(review.seller_id)

        return saved


class RejectReviewUseCase:
    """Отклонить отзыв с причиной: автор увидит её и сможет исправить отзыв."""

    def __init__(self, reviews: ReviewRepository) -> None:
        self.reviews = reviews

    async def execute(self, review: Review, reason: str) -> Review:
        """Вернуть отклонённый отзыв."""

        review.status = ReviewStatus.REJECTED
        review.reject_reason = reason.strip()

        saved = await self.reviews.save(review)
        await self.reviews.refresh_seller_rating(review.seller_id)

        return saved


class EditReviewTextUseCase:
    """Поправить текст отзыва модератором, не меняя его состояние."""

    def __init__(self, reviews: ReviewRepository) -> None:
        self.reviews = reviews

    async def execute(self, review: Review, text: str | None) -> Review:
        """Вернуть отзыв с новым текстом."""

        review.text = clean_text(text)

        return await self.reviews.save(review)
