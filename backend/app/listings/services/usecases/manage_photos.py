"""Сценарии фото объявления до публикации: загрузить и удалить."""

from fastapi import UploadFile
from sqlalchemy.exc import SQLAlchemyError

from app.core.uploads import remove_image, save_image
from app.listings.models import ListingPhoto
from app.listings.services.exceptions import PhotoNotFoundError, TooManyPhotosError
from app.listings.services.repo import ListingPhotoRepository
from app.users.models import User

LISTINGS_FOLDER = "listings"
MAX_FREE_PHOTOS = 30


class UploadListingPhotoUseCase:
    """Сохранить фото на сервер. К объявлению оно привяжется при сохранении формы."""

    def __init__(self, photos: ListingPhotoRepository) -> None:
        self.photos = photos

    async def execute(self, user: User, file: UploadFile) -> ListingPhoto:
        """Вернуть загруженное фото. Бросает UploadError и TooManyPhotosError."""

        if await self.photos.count_free(user.id) >= MAX_FREE_PHOTOS:
            raise TooManyPhotosError(user.id)

        path = await save_image(file, LISTINGS_FOLDER)

        try:
            return await self.photos.add(ListingPhoto(owner_id=user.id, path=path))
        except SQLAlchemyError:
            remove_image(path)
            raise


class DeleteListingPhotoUseCase:
    """Удалить загруженное, но ещё не привязанное к объявлению фото."""

    def __init__(self, photos: ListingPhotoRepository) -> None:
        self.photos = photos

    async def execute(self, user: User, photo_id: int) -> None:
        """Удалить фото из базы и с диска. Чужое или привязанное — PhotoNotFoundError."""

        photo = await self.photos.get_by_id(photo_id)
        if photo is None or photo.owner_id != user.id or photo.listing_id is not None:
            raise PhotoNotFoundError(photo_id)

        path = photo.path
        await self.photos.delete(photo)
        remove_image(path)
