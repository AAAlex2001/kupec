"""Пользователи: репозиторий и фабрики сценариев профиля."""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.cities.dependencies import get_city_repository
from app.cities.services.repo import CityRepository
from app.core.database import get_session
from app.users.services.repo import UserRepository
from app.users.services.usecases.manage_avatar import RemoveAvatarUseCase, SetAvatarUseCase
from app.users.services.usecases.update_profile import UpdateProfileUseCase


def get_user_repository(
    session: AsyncSession = Depends(get_session),
) -> UserRepository:
    """Репозиторий пользователей с сессией текущего запроса."""

    return UserRepository(session)


def get_update_profile_usecase(
    users: UserRepository = Depends(get_user_repository),
    cities: CityRepository = Depends(get_city_repository),
) -> UpdateProfileUseCase:
    """Сценарий изменения профиля."""

    return UpdateProfileUseCase(users, cities)


def get_set_avatar_usecase(
    users: UserRepository = Depends(get_user_repository),
) -> SetAvatarUseCase:
    """Сценарий загрузки аватара."""

    return SetAvatarUseCase(users)


def get_remove_avatar_usecase(
    users: UserRepository = Depends(get_user_repository),
) -> RemoveAvatarUseCase:
    """Сценарий удаления аватара."""

    return RemoveAvatarUseCase(users)
