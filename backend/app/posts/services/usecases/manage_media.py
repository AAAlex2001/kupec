"""Сценарии файлов к посту до публикации: загрузить и удалить."""

from fastapi import UploadFile
from sqlalchemy.exc import SQLAlchemyError

from app.core.uploads import MEGABYTE, remove_file, save_image, save_video
from app.posts.models import MediaKind, PostMedia
from app.posts.services.exceptions import PostMediaNotFoundError, TooManyPostMediaError
from app.posts.services.repo import PostMediaRepository
from app.users.models import User

POSTS_FOLDER = "posts"
MAX_FREE_MEDIA = 30
MAX_MEDIA_SIZE_BYTES = 50 * MEGABYTE


class UploadPostMediaUseCase:
    """Сохранить фото или видео на сервер. К посту файл привяжется при публикации."""

    def __init__(self, media: PostMediaRepository) -> None:
        self.media = media

    async def execute(self, user: User, file: UploadFile, kind: MediaKind) -> PostMedia:
        """Вернуть загруженный файл. Бросает UploadError и TooManyPostMediaError."""

        if await self.media.count_free(user.id) >= MAX_FREE_MEDIA:
            raise TooManyPostMediaError(user.id)

        if kind == MediaKind.VIDEO:
            path = await save_video(file, POSTS_FOLDER, MAX_MEDIA_SIZE_BYTES)
        else:
            path = await save_image(file, POSTS_FOLDER, MAX_MEDIA_SIZE_BYTES)

        try:
            return await self.media.add(PostMedia(owner_id=user.id, kind=kind, path=path))
        except SQLAlchemyError:
            remove_file(path)
            raise


class DeletePostMediaUseCase:
    """Удалить загруженный, но ещё не опубликованный файл."""

    def __init__(self, media: PostMediaRepository) -> None:
        self.media = media

    async def execute(self, user: User, media_id: int) -> None:
        """Удалить файл из базы и с диска. Чужой или привязанный — PostMediaNotFoundError."""

        item = await self.media.get_by_id(media_id)
        if item is None or item.owner_id != user.id or item.post_id is not None:
            raise PostMediaNotFoundError(media_id)

        path = item.path
        await self.media.delete(item)
        remove_file(path)
