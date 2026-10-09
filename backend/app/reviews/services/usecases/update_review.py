"""Сценарий правки своего отзыва."""

from app.core.uploads import remove_image
from app.reviews.models import Review
from app.reviews.schemas import ReviewSaveSchema
from app.reviews.services.usecases.save_review import SaveReviewUseCase


class UpdateReviewUseCase(SaveReviewUseCase):
    """Изменить отзыв. Он снова уходит на проверку, убранные фото удаляются."""

    async def execute(self, review: Review, payload: ReviewSaveSchema) -> Review:
        """Вернуть изменённый отзыв и пересчитать рейтинг продавца."""

        photos = await self.check_photos(review.author_id, payload.photo_ids, review.id)
        removed_paths = [photo.path for photo in review.photos if photo not in photos]

        self.fill(review, payload, photos)
        saved = await self.reviews.save(review)
        await self.reviews.refresh_seller_rating(review.seller_id)

        for path in removed_paths:
            remove_image(path)

        return saved
