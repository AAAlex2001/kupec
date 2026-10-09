"""Сценарии справочника единиц цены."""

from app.units.models import Unit
from app.units.schemas import UnitCreateSchema, UnitUpdateSchema
from app.units.services.exceptions import InvalidUnitError, UnitInUseError
from app.units.services.repo import UnitRepository


class CreateUnitUseCase:
    """Добавить единицу в конец списка своего типа."""

    def __init__(self, units: UnitRepository) -> None:
        self.units = units

    async def execute(self, payload: UnitCreateSchema) -> Unit:
        """Вернуть новую единицу. Код занят — InvalidUnitError."""

        if await self.units.code_taken(payload.code):
            raise InvalidUnitError(f"Код «{payload.code}» уже занят")

        unit = Unit(
            code=payload.code,
            label=payload.label,
            kind=payload.kind,
            sort_order=await self.units.next_position(payload.kind),
        )

        return await self.units.add(unit)


class UpdateUnitUseCase:
    """Переименовать единицу. Код и тип не меняются — по ним она хранится в объявлениях."""

    def __init__(self, units: UnitRepository) -> None:
        self.units = units

    async def execute(self, unit: Unit, payload: UnitUpdateSchema) -> Unit:
        """Вернуть единицу с новой подписью."""

        unit.label = payload.label

        return await self.units.save(unit)


class DeleteUnitUseCase:
    """Удалить единицу, которой нет ни в одном объявлении."""

    def __init__(self, units: UnitRepository) -> None:
        self.units = units

    async def execute(self, unit: Unit) -> None:
        """Удалить. Единица указана в объявлениях — UnitInUseError."""

        if await self.units.is_used(unit.code):
            raise UnitInUseError("Единица указана в объявлениях — её можно только переименовать")

        await self.units.delete(unit)
