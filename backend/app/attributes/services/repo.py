"""Репозиторий атрибутов: запросы к attributes, attribute_options и category_attributes."""

from sqlalchemy import delete, exists, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.attributes.models import Attribute, CategoryAttribute
from app.listings.models import Listing


class AttributeRepository:
    """Доступ к справочнику атрибутов и их привязкам к категориям. Коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, attribute_id: int) -> Attribute | None:
        """Атрибут с вариантами по id или None."""

        return await self.db.get(Attribute, attribute_id)

    async def list_all(self) -> list[Attribute]:
        """Все атрибуты с вариантами, по названию."""

        result = await self.db.execute(select(Attribute).order_by(Attribute.name))

        return list(result.scalars().all())

    async def list_by_ids(self, attribute_ids: list[int]) -> list[Attribute]:
        """Атрибуты из списка id."""

        result = await self.db.execute(select(Attribute).where(Attribute.id.in_(attribute_ids)))

        return list(result.scalars().all())

    async def slug_taken(self, slug: str) -> bool:
        """Занят ли адрес атрибута."""

        return bool(await self.db.scalar(select(exists().where(Attribute.slug == slug))))

    async def list_bindings(self, category_ids: list[int]) -> list[CategoryAttribute]:
        """Привязки атрибутов к категориям из списка, вместе с атрибутами и вариантами."""

        stmt = select(CategoryAttribute).where(CategoryAttribute.category_id.in_(category_ids))
        result = await self.db.execute(stmt)

        return list(result.unique().scalars().all())

    async def replace_bindings(self, category_id: int, bindings: list[CategoryAttribute]) -> None:
        """Заменить все привязки категории новым списком."""

        await self.db.execute(
            delete(CategoryAttribute).where(CategoryAttribute.category_id == category_id)
        )
        self.db.add_all(bindings)
        await self.db.commit()

    async def add(self, attribute: Attribute) -> Attribute:
        """Сохранить новый атрибут с вариантами."""

        self.db.add(attribute)
        await self.db.commit()
        await self.db.refresh(attribute)

        return attribute

    async def save(self, attribute: Attribute) -> Attribute:
        """Сохранить изменения атрибута и его вариантов."""

        await self.db.commit()
        await self.db.refresh(attribute)

        return attribute

    async def delete(self, attribute: Attribute) -> None:
        """Удалить атрибут вместе с вариантами, привязками и его значениями в объявлениях."""

        await self.db.execute(
            update(Listing)
            .where(Listing.attributes.has_key(attribute.slug))
            .values(attributes=Listing.attributes.op("-")(attribute.slug))
        )
        await self.db.delete(attribute)
        await self.db.commit()
