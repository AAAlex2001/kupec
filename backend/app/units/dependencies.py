"""Единицы цены: репозиторий, сценарии и единица по id из пути."""

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.units.models import Unit
from app.units.services.repo import UnitRepository
from app.units.services.usecases.category_units import BindUnitsUseCase, LoadCategoryUnitsUseCase
from app.units.services.usecases.manage_units import (
    CreateUnitUseCase,
    DeleteUnitUseCase,
    UpdateUnitUseCase,
)


def get_unit_repository(
    session: AsyncSession = Depends(get_session),
) -> UnitRepository:
    """Репозиторий единиц с сессией текущего запроса."""

    return UnitRepository(session)


def get_load_units_usecase(
    units: UnitRepository = Depends(get_unit_repository),
) -> LoadCategoryUnitsUseCase:
    """Сценарий: единицы, доступные в категории."""

    return LoadCategoryUnitsUseCase(units)


def get_bind_units_usecase(
    units: UnitRepository = Depends(get_unit_repository),
) -> BindUnitsUseCase:
    """Сценарий: задать единицы категории."""

    return BindUnitsUseCase(units)


def get_create_unit_usecase(
    units: UnitRepository = Depends(get_unit_repository),
) -> CreateUnitUseCase:
    """Сценарий новой единицы."""

    return CreateUnitUseCase(units)


def get_update_unit_usecase(
    units: UnitRepository = Depends(get_unit_repository),
) -> UpdateUnitUseCase:
    """Сценарий переименования единицы."""

    return UpdateUnitUseCase(units)


def get_delete_unit_usecase(
    units: UnitRepository = Depends(get_unit_repository),
) -> DeleteUnitUseCase:
    """Сценарий удаления единицы."""

    return DeleteUnitUseCase(units)


async def get_unit(
    unit_id: int,
    units: UnitRepository = Depends(get_unit_repository),
) -> Unit:
    """Единица по id из пути. Нет — 404."""

    unit = await units.get_by_id(unit_id)
    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Единица не найдена",
        )

    return unit
