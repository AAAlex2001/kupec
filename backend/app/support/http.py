"""Общее для ручек поддержки посетителя и админки: отправка сообщения с понятными ошибками."""

from fastapi import HTTPException, UploadFile, status

from app.core.uploads import UploadError
from app.support.models import SupportThread
from app.support.schemas import SupportMessageSchema
from app.support.services.exceptions import (
    EmptySupportMessageError,
    TooManySupportMessagesError,
    TooManySupportPhotosError,
)
from app.support.services.usecases.send_message import SendSupportMessageUseCase


async def send_message(
    usecase: SendSupportMessageUseCase,
    thread: SupportThread,
    text: str,
    photos: list[UploadFile],
    from_admin: bool,
) -> SupportMessageSchema:
    """Отправить сообщение. Пустое или с плохими фото — 422, спам — 429."""

    try:
        message = await usecase.execute(thread, text, photos, from_admin)
    except (EmptySupportMessageError, TooManySupportPhotosError, UploadError) as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(error)) from error
    except TooManySupportMessagesError as error:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(error)) from error

    return SupportMessageSchema.model_validate(message)
