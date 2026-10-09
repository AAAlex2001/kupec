"""Сценарии фото к отзыву до отправки: загрузить и удалить."""

from fastapi import UploadFile
from sqlalchemy.exc import SQLAlchemyError

from app.core.uploads import remove_image, save_image
from app.reviews.models import ReviewPhoto
from app.reviews.services.exceptions import ReviewPhotoNotFoundError, TooManyReviewPhotosError
from app.reviews.services.repo import ReviewPhotoRepository
from app.users.models import User

REVIEWS_FOLDER = "reviews"
MAX_FREE_PHOTOS = 30


class UploadReviewPhotoUseCase:
    """Сохранить фото на сервер. К отзыву оно привяжется при отправке формы."""

    def __init__(self, photos: ReviewPhotoRepository) -> None:
        self.photos = photos

    async def execute(self, user: User, file: UploadFile) -> ReviewPhoto:
        """Вернуть загруженное фото. Бросает UploadError и TooManyReviewPhotosError."""

        if await self.photos.count_free(user.id) >= MAX_FREE_PHOTOS:
            raise TooManyReviewPhotosError(user.id)

        path = await save_image(file, REVIEWS_FOLDER)

        try:
            return await self.photos.add(ReviewPhoto(owner_id=user.id, path=path))
        except SQLAlchemyError:
            remove_image(path)
            raise


class DeleteReviewPhotoUseCase:
    """Удалить загруженное, но ещё не привязанное к отзыву фото."""

    def __init__(self, photos: ReviewPhotoRepository) -> None:
        self.photos = photos

    async def execute(self, user: User, photo_id: int) -> None:
        """Удалить фото из базы и с диска. Чужое или привязанное — ReviewPhotoNotFoundError."""

        photo = await self.photos.get_by_id(photo_id)
        if photo is None or photo.owner_id != user.id or photo.review_id is not None:
            raise ReviewPhotoNotFoundError(photo_id)

        path = photo.path
        await self.photos.delete(photo)
        remove_image(path)
