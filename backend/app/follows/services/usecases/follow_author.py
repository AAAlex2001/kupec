"""Сценарий подписки на автора."""

from app.follows.services.exceptions import FollowNotAllowedError
from app.follows.services.repo import FollowRepository
from app.notifications.models import Notification, NotificationKind
from app.notifications.services.usecases.notify import NotifyUseCase
from app.users.models import User
from app.users.services.repo import UserRepository


class FollowAuthorUseCase:
    """Подписаться на автора: он должен существовать и не быть вами. Автору приходит уведомление."""

    def __init__(
        self, follows: FollowRepository, users: UserRepository, notify: NotifyUseCase
    ) -> None:
        self.follows = follows
        self.users = users
        self.notify = notify

    async def execute(self, user: User, author_id: int) -> None:
        """Подписаться. Нельзя — FollowNotAllowedError."""

        if author_id == user.id:
            raise FollowNotAllowedError("Нельзя подписаться на себя")

        if await self.users.get_by_id(author_id) is None:
            raise FollowNotAllowedError("Автор не найден")

        await self.follows.add(user.id, author_id)
        await self.notify.execute(
            Notification(user_id=author_id, actor_id=user.id, kind=NotificationKind.FOLLOW)
        )
