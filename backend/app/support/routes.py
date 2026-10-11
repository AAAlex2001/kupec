from fastapi import APIRouter, Depends, File, Form, UploadFile, status

from app.auth.dependencies import get_current_user, get_visitor
from app.support.dependencies import get_send_support_message_usecase, get_support_repository
from app.support.http import send_message
from app.support.models import MAX_SUPPORT_TEXT
from app.support.schemas import SupportMessageSchema, SupportThreadSchema, SupportUnreadSchema
from app.support.services.repo import SupportRepository
from app.support.services.usecases.send_message import SendSupportMessageUseCase
from app.users.models import User

router = APIRouter(prefix="/support", tags=["support"])


@router.get("/thread")
async def get_thread(
    visitor: str = Depends(get_visitor),
    support: SupportRepository = Depends(get_support_repository),
) -> SupportThreadSchema:
    """Переписка посетителя с поддержкой. Открыта всем: гость — по cookie. Ответы отмечаются прочитанными."""

    thread = await support.get_by_visitor(visitor)
    if thread is None:
        return SupportThreadSchema()

    await support.mark_read(thread, by_admin=False)
    messages = await support.messages(thread.id)

    return SupportThreadSchema(messages=[SupportMessageSchema.model_validate(item) for item in messages])


@router.get("/unread")
async def get_unread(
    visitor: str = Depends(get_visitor),
    support: SupportRepository = Depends(get_support_repository),
) -> SupportUnreadSchema:
    """Сколько ответов поддержки посетитель ещё не видел. Для счётчика на кнопке «Поддержка»."""

    thread = await support.get_by_visitor(visitor)

    return SupportUnreadSchema(count=thread.unread_for_visitor if thread else 0)


@router.post("/messages", status_code=status.HTTP_201_CREATED)
async def create_message(
    text: str = Form("", max_length=MAX_SUPPORT_TEXT),
    photos: list[UploadFile] = File([]),
    visitor: str = Depends(get_visitor),
    user: User | None = Depends(get_current_user),
    support: SupportRepository = Depends(get_support_repository),
    usecase: SendSupportMessageUseCase = Depends(get_send_support_message_usecase),
) -> SupportMessageSchema:
    """Написать в поддержку: текст и до 5 фото. Первое сообщение открывает переписку."""

    thread = await support.open_thread(visitor, user.id if user else None)

    return await send_message(usecase, thread, text, photos, from_admin=False)
