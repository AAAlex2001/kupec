"""Подписки: репозиторий и фабрика сценария."""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.follows.services.repo import FollowRepository
from app.follows.services.usecases.follow_author import FollowAuthorUseCase
from app.notifications.dependencies import get_notify_usecase
from app.notifications.services.usecases.notify import NotifyUseCase
from app.users.dependencies import get_user_repository
from app.users.services.repo import UserRepository


def get_follow_repository(
    session: AsyncSession = Depends(get_session),
) -> FollowRepository:
    """Репозиторий подписок с сессией текущего запроса."""

    return FollowRepository(session)


def get_follow_author_usecase(
    follows: FollowRepository = Depends(get_follow_repository),
    users: UserRepository = Depends(get_user_repository),
    notify: NotifyUseCase = Depends(get_notify_usecase),
) -> FollowAuthorUseCase:
    """Сценарий подписки на автора."""

    return FollowAuthorUseCase(follows, users, notify)
