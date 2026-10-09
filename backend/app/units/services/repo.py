"""Репозиторий единиц цены: только запросы к таблице units."""

from sqlalchemy import delete, exists, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.listings.models import Listing
from app.units.models import CategoryUnit, Unit


class UnitRepository:
    """Доступ к справочнику единиц. Коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, unit_id: int) -> Unit | None:
        """Единица по id или None."""

        return await self.db.get(Unit, unit_id)

    async def get_by_code(self, code: str) -> Unit | None:
        """Единица по коду или None."""

        return await self.db.scalar(select(Unit).where(Unit.code == code))

    async def list_all(self) -> list[Unit]:
        """Все единицы: сначала для товаров, потом для услуг, внутри — по порядку."""

        result = await self.db.execute(select(Unit).order_by(Unit.kind, Unit.sort_order, Unit.id))

        return list(result.scalars().all())

    async def list_by_kind(self, kind: str) -> list[Unit]:
        """Единицы для товаров или для услуг, по порядку."""

        stmt = select(Unit).where(Unit.kind == kind).order_by(Unit.sort_order, Unit.id)
        result = await self.db.execute(stmt)

        return list(result.scalars().all())

    async def list_by_ids(self, unit_ids: list[int]) -> list[Unit]:
        """Единицы из списка id."""

        result = await self.db.execute(select(Unit).where(Unit.id.in_(unit_ids)))

        return list(result.scalars().all())

    async def list_bindings(self, category_ids: list[int]) -> list[CategoryUnit]:
        """Привязки единиц к категориям из списка, по порядку, вместе с единицами."""

        stmt = (
            select(CategoryUnit)
            .where(CategoryUnit.category_id.in_(category_ids))
            .order_by(CategoryUnit.sort_order)
        )
        result = await self.db.execute(stmt)

        return list(result.unique().scalars().all())

    async def replace_bindings(self, category_id: int, bindings: list[CategoryUnit]) -> None:
        """Заменить все единицы категории новым списком."""

        await self.db.execute(delete(CategoryUnit).where(CategoryUnit.category_id == category_id))
        self.db.add_all(bindings)
        await self.db.commit()

    async def code_taken(self, code: str) -> bool:
        """Занят ли код."""

        return bool(await self.db.scalar(select(exists().where(Unit.code == code))))

    async def is_used(self, code: str) -> bool:
        """Указана ли единица хотя бы в одном объявлении."""

        return bool(await self.db.scalar(select(exists().where(Listing.unit == code))))

    async def next_position(self, kind: str) -> int:
        """Место в конце списка единиц этого типа."""

        last = await self.db.scalar(select(func.max(Unit.sort_order)).where(Unit.kind == kind))

        return (last if last is not None else -1) + 1

    async def add(self, unit: Unit) -> Unit:
        """Сохранить новую единицу."""

        self.db.add(unit)
        await self.db.commit()
        await self.db.refresh(unit)

        return unit

    async def save(self, unit: Unit) -> Unit:
        """Сохранить изменения единицы."""

        await self.db.commit()
        await self.db.refresh(unit)

        return unit

    async def delete(self, unit: Unit) -> None:
        """Удалить единицу."""

        await self.db.delete(unit)
        await self.db.commit()
