"""Общее для создания и правки отзыва: проверка фото и перенос полей."""

from app.reviews.models import Review, ReviewPhoto, ReviewStatus
from app.reviews.schemas import ReviewSaveSchema
from app.reviews.services.exceptions import ReviewPhotoNotFoundError
from app.reviews.services.repo import ReviewPhotoRepository, ReviewRepository
from app.reviews.services.validators import clean_text, rejection_reason


class SaveReviewUseCase:
    """Проверить фото отзыва и записать поля формы в отзыв."""

    def __init__(self, reviews: ReviewRepository, photos: ReviewPhotoRepository) -> None:
        self.reviews = reviews
        self.photos = photos

    async def check_photos(
        self, owner_id: int, photo_ids: list[int], review_id: int | None
    ) -> list[ReviewPhoto]:
        """Фото по порядку из формы. Чужое или уже занятое — ReviewPhotoNotFoundError."""

        photo_ids = list(dict.fromkeys(photo_ids))
        photos = await self.photos.list_usable(owner_id, photo_ids, review_id)
        if len(photos) != len(photo_ids):
            raise ReviewPhotoNotFoundError("Фото не найдено, загрузите его заново")

        by_id = {photo.id: photo for photo in photos}

        return [by_id[photo_id] for photo_id in photo_ids]

    def fill(self, review: Review, payload: ReviewSaveSchema, photos: list[ReviewPhoto]) -> None:
        """Перенести поля в отзыв. Отзыв уходит на проверку или сразу отклоняется автопроверкой."""

        review.rating = payload.rating
        review.text = clean_text(payload.text)
        review.anonymous = payload.anonymous

        for position, photo in enumerate(photos):
            photo.sort_order = position
        review.photos = photos

        review.reject_reason = rejection_reason(review.text)
        review.status = ReviewStatus.REJECTED if review.reject_reason else ReviewStatus.PENDING
