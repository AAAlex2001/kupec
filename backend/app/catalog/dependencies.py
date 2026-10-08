"""Категории: репозиторий."""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.catalog.services.repo import CategoryRepository
from app.core.database import get_session


def get_category_repository(
    session: AsyncSession = Depends(get_session),
) -> CategoryRepository:
    """Репозиторий категорий с сессией текущего запроса."""

    return CategoryRepository(session)
