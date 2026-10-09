"""Сценарий привязки атрибутов к категории."""

from app.attributes.models import CategoryAttribute
from app.attributes.schemas import CategoryAttributeInput
from app.attributes.services.exceptions import InvalidAttributeError
from app.attributes.services.repo import AttributeRepository
from app.catalog.models import Category


class BindAttributesUseCase:
    """Задать свои атрибуты категории по порядку. Подкатегории получат их автоматически."""

    def __init__(self, attributes: AttributeRepository) -> None:
        self.attributes = attributes

    async def execute(self, category: Category, items: list[CategoryAttributeInput]) -> None:
        """Заменить список. Ошибки — InvalidAttributeError."""

        ids = [item.attribute_id for item in items]
        if len(set(ids)) != len(ids):
            raise InvalidAttributeError("Атрибут указан дважды")

        if len(await self.attributes.list_by_ids(ids)) != len(ids):
            raise InvalidAttributeError("Такого атрибута нет")

        bindings = [
            CategoryAttribute(
                category_id=category.id,
                attribute_id=item.attribute_id,
                is_required=item.is_required,
                sort_order=position,
            )
            for position, item in enumerate(items)
        ]

        await self.attributes.replace_bindings(category.id, bindings)
