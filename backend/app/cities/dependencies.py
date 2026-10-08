"""Города: репозиторий."""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.cities.services.repo import CityRepository
from app.core.database import get_session


def get_city_repository(
    session: AsyncSession = Depends(get_session),
) -> CityRepository:
    """Репозиторий городов с сессией текущего запроса."""

    return CityRepository(session)
