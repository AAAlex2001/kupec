"""Сценарий ответа продавца на отзыв."""

from datetime import datetime, timezone

from app.reviews.models import Review, ReviewStatus
from app.reviews.services.exceptions import ReviewNotFoundError
from app.reviews.services.repo import ReviewRepository
from app.users.models import User


class ReplyReviewUseCase:
    """Ответить на опубликованный отзыв о себе. Повторный ответ заменяет прежний."""

    def __init__(self, reviews: ReviewRepository) -> None:
        self.reviews = reviews

    async def execute(self, user: User, review: Review, text: str) -> Review:
        """Вернуть отзыв с ответом. Чужой или неопубликованный — ReviewNotFoundError."""

        if review.seller_id != user.id or review.status != ReviewStatus.PUBLISHED:
            raise ReviewNotFoundError(review.id)

        review.reply_text = text.strip()
        review.reply_at = datetime.now(timezone.utc)

        return await self.reviews.save(review)
