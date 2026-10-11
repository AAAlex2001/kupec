from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status

from app.auth.dependencies import require_admin
from app.support.dependencies import get_send_support_message_usecase, get_support_repository
from app.support.http import send_message
from app.support.models import MAX_SUPPORT_TEXT, SupportThread
from app.support.schemas import (
    AdminSupportDetailSchema,
    AdminSupportPageSchema,
    AdminSupportThreadSchema,
    SupportMessageSchema,
)
from app.support.services.repo import SupportRepository
from app.support.services.usecases.send_message import SendSupportMessageUseCase

router = APIRouter(prefix="/admin/support", tags=["admin"], dependencies=[Depends(require_admin)])


async def get_thread(thread_id: int, support: SupportRepository = Depends(get_support_repository)) -> SupportThread:
    """Обращение по id из пути. Нет — 404."""

    thread = await support.get(thread_id)
    if thread is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Обращение не найдено")

    return thread


@router.get("")
async def list_threads(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    support: SupportRepository = Depends(get_support_repository),
) -> AdminSupportPageSchema:
    """Обращения: сначала без ответа, потом свежие. И сколько ждут ответа."""

    items, total = await support.page(limit, offset)

    return AdminSupportPageSchema(
        items=[AdminSupportThreadSchema.model_validate(item) for item in items],
        total=total,
        unread=await support.count_unread(),
    )


@router.get("/{thread_id}")
async def get_detail(
    thread: SupportThread = Depends(get_thread),
    support: SupportRepository = Depends(get_support_repository),
) -> AdminSupportDetailSchema:
    """Обращение целиком. Открыли — значит прочитали."""

    await support.mark_read(thread, by_admin=True)
    messages = await support.messages(thread.id)

    return AdminSupportDetailSchema(
        thread=AdminSupportThreadSchema.model_validate(thread),
        messages=[SupportMessageSchema.model_validate(item) for item in messages],
    )


@router.post("/{thread_id}/messages", status_code=status.HTTP_201_CREATED)
async def reply(
    text: str = Form("", max_length=MAX_SUPPORT_TEXT),
    photos: list[UploadFile] = File([]),
    thread: SupportThread = Depends(get_thread),
    usecase: SendSupportMessageUseCase = Depends(get_send_support_message_usecase),
) -> SupportMessageSchema:
    """Ответить посетителю: текст и до 5 фото."""

    return await send_message(usecase, thread, text, photos, from_admin=True)
