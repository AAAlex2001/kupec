"""Сценарий уведомления."""

from app.notifications.models import Notification
from app.notifications.services.repo import NotificationRepository


class NotifyUseCase:
    """Уведомить пользователя о действии другого. О своих действиях и повторах не уведомляем."""

    def __init__(self, notifications: NotificationRepository) -> None:
        self.notifications = notifications

    async def execute(self, notification: Notification) -> None:
        """Сохранить уведомление, если оно нужно."""

        if notification.user_id == notification.actor_id:
            return

        if await self.notifications.exists(notification):
            return

        await self.notifications.add(notification)
