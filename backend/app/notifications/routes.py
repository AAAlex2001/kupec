from fastapi import APIRouter, Depends, Query, status

from app.auth.dependencies import require_user
from app.notifications.dependencies import get_notification_repository
from app.notifications.schemas import NotificationPageSchema, NotificationSchema, UnreadSchema
from app.notifications.services.repo import NotificationRepository
from app.users.models import User

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    user: User = Depends(require_user),
    notifications: NotificationRepository = Depends(get_notification_repository),
) -> NotificationPageSchema:
    """Свои уведомления, новые первыми."""

    items, total = await notifications.list_for_user(user.id, limit, offset)

    return NotificationPageSchema(
        items=[NotificationSchema.model_validate(item) for item in items], total=total
    )


@router.get("/unread")
async def count_unread(
    user: User = Depends(require_user),
    notifications: NotificationRepository = Depends(get_notification_repository),
) -> UnreadSchema:
    """Сколько непрочитанных уведомлений — для красного счётчика."""

    return UnreadSchema(count=await notifications.count_unread(user.id))


@router.post("/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_read(
    user: User = Depends(require_user),
    notifications: NotificationRepository = Depends(get_notification_repository),
) -> None:
    """Отметить все уведомления прочитанными."""

    await notifications.mark_read(user.id)
