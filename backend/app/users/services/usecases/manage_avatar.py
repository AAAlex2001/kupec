"""Сценарии загрузки и удаления аватара."""

from fastapi import UploadFile
from sqlalchemy.exc import SQLAlchemyError

from app.core.uploads import remove_file, save_image
from app.users.models import User
from app.users.services.repo import UserRepository

AVATARS_FOLDER = "avatars"


class SetAvatarUseCase:
    """Загрузить новый аватар и удалить прежний."""

    def __init__(self, users: UserRepository) -> None:
        self.users = users

    async def execute(self, user: User, file: UploadFile) -> User:
        """Вернуть пользователя с новым аватаром. Бросает UploadError, если файл не подходит."""

        path = await save_image(file, AVATARS_FOLDER)

        old_path = user.avatar_path
        user.avatar_path = path

        try:
            saved = await self.users.save(user)
        except SQLAlchemyError:
            remove_file(path)
            raise

        if old_path is not None:
            remove_file(old_path)

        return saved


class RemoveAvatarUseCase:
    """Удалить аватар: в профиле снова будет буква имени."""

    def __init__(self, users: UserRepository) -> None:
        self.users = users

    async def execute(self, user: User) -> User:
        """Вернуть пользователя без аватара."""

        old_path = user.avatar_path
        user.avatar_path = None

        saved = await self.users.save(user)

        if old_path is not None:
            remove_file(old_path)

        return saved
