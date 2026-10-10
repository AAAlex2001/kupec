"""Сценарий удаления отзыва: автором или модератором."""

from app.core.uploads import remove_file
from app.reviews.models import Review
from app.reviews.services.repo import ReviewRepository


class DeleteReviewUseCase:
    """Удалить отзыв вместе с фото и пересчитать рейтинг продавца."""

    def __init__(self, reviews: ReviewRepository) -> None:
        self.reviews = reviews

    async def execute(self, review: Review) -> None:
        """Удалить отзыв."""

        paths = [photo.path for photo in review.photos]
        seller_id = review.seller_id

        await self.reviews.delete(review)
        await self.reviews.refresh_seller_rating(seller_id)

        for path in paths:
            remove_file(path)
