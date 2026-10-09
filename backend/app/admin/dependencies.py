"""Админка: репозитории со списками пользователей и объявлений."""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.admin.services.repo import AdminListingRepository, AdminUserRepository
from app.core.database import get_session


def get_admin_user_repository(
    session: AsyncSession = Depends(get_session),
) -> AdminUserRepository:
    """Пользователи для админки с сессией текущего запроса."""

    return AdminUserRepository(session)


def get_admin_listing_repository(
    session: AsyncSession = Depends(get_session),
) -> AdminListingRepository:
    """Объявления для админки с сессией текущего запроса."""

    return AdminListingRepository(session)
