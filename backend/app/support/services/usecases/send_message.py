"""Сценарий сообщения в поддержку: от посетителя или ответ администратора."""

from datetime import datetime, timedelta, timezone

from fastapi import UploadFile
from sqlalchemy.exc import SQLAlchemyError

from app.core.uploads import PHOTO_MAX_SIZE_BYTES, UploadError, remove_file, save_image
from app.support.models import MAX_PREVIEW, MAX_SUPPORT_PHOTOS, SupportMessage, SupportPhoto, SupportThread
from app.support.services.exceptions import (
    EmptySupportMessageError,
    TooManySupportMessagesError,
    TooManySupportPhotosError,
)
from app.support.services.repo import SupportRepository

SUPPORT_FOLDER = "support"
MESSAGES_PER_MINUTE = 15


class SendSupportMessageUseCase:
    """Сохранить сообщение с фото и отметить, кому оно непрочитано."""

    def __init__(self, support: SupportRepository) -> None:
        self.support = support

    async def execute(
        self, thread: SupportThread, text: str, files: list[UploadFile], from_admin: bool
    ) -> SupportMessage:
        """Вернуть сообщение. Пустое, лишние фото и спам от посетителя — ошибки сценария, плохой файл — UploadError."""

        text = text.strip()
        if not text and not files:
            raise EmptySupportMessageError("Напишите сообщение или приложите фото")
        if len(files) > MAX_SUPPORT_PHOTOS:
            raise TooManySupportPhotosError(f"Можно приложить до {MAX_SUPPORT_PHOTOS} фото")
        if not from_admin:
            await self.check_rate(thread)

        paths = await self.save_photos(files)
        message = SupportMessage(
            thread_id=thread.id,
            from_admin=from_admin,
            text=text,
            photos=[SupportPhoto(path=path) for path in paths],
        )
        thread.preview = (text or "Фото")[:MAX_PREVIEW]
        thread.last_message_at = datetime.now(timezone.utc)
        thread.unread_for_admin = not from_admin
        if from_admin:
            thread.unread_admin_count = 0
        thread.unread_for_visitor = thread.unread_for_visitor + 1 if from_admin else 0

        try:
            return await self.support.add_message(message)
        except SQLAlchemyError:
            for path in paths:
                remove_file(path)
            raise

    async def save_photos(self, files: list[UploadFile]) -> list[str]:
        """Сохранить фото на диск. Если одно не подошло, уже сохранённые удаляются."""

        paths: list[str] = []
        try:
            for file in files:
                paths.append(await save_image(file, SUPPORT_FOLDER, PHOTO_MAX_SIZE_BYTES))
        except UploadError:
            for path in paths:
                remove_file(path)
            raise

        return paths

    async def check_rate(self, thread: SupportThread) -> None:
        """Посетитель — не больше 15 сообщений в минуту."""

        since = datetime.now(timezone.utc) - timedelta(minutes=1)
        if await self.support.count_since(thread.id, since) >= MESSAGES_PER_MINUTE:
            raise TooManySupportMessagesError("Слишком часто. Подождите минуту и напишите снова")
