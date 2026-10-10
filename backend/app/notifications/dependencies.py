"""Уведомления: репозиторий и фабрика сценария."""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.notifications.services.repo import NotificationRepository
from app.notifications.services.usecases.notify import NotifyUseCase


def get_notification_repository(
    session: AsyncSession = Depends(get_session),
) -> NotificationRepository:
    """Репозиторий уведомлений с сессией текущего запроса."""

    return NotificationRepository(session)


def get_notify_usecase(
    notifications: NotificationRepository = Depends(get_notification_repository),
) -> NotifyUseCase:
    """Сценарий уведомления."""

    return NotifyUseCase(notifications)
