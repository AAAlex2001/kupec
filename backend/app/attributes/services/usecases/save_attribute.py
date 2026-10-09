"""Сценарии создания и правки атрибута вместе с вариантами."""

from app.attributes.models import TYPES_WITH_OPTIONS, Attribute, AttributeOption
from app.attributes.schemas import (
    AttributeCreateSchema,
    AttributeOptionInput,
    AttributeUpdateSchema,
)
from app.attributes.services.exceptions import InvalidAttributeError
from app.attributes.services.repo import AttributeRepository


class SaveAttributeUseCase:
    """Общее для создания и правки: поля атрибута и список вариантов."""

    def __init__(self, attributes: AttributeRepository) -> None:
        self.attributes = attributes

    def check_options(self, attribute_type: str, options: list[AttributeOptionInput]) -> None:
        """У списка есть варианты без повторов, у остальных типов вариантов нет."""

        if attribute_type not in TYPES_WITH_OPTIONS:
            if options:
                raise InvalidAttributeError("Варианты бывают только у списков")
            return

        if not options:
            raise InvalidAttributeError("Добавьте хотя бы один вариант")

        values = [option.value for option in options]
        if len(set(values)) != len(values):
            raise InvalidAttributeError("Значения вариантов повторяются")

    def fill(self, attribute: Attribute, payload: AttributeUpdateSchema) -> None:
        """Перенести поля и варианты. Существующие варианты сохраняют значение, лишние удаляются."""

        attribute.name = payload.name
        attribute.unit = payload.unit or None
        attribute.is_filterable = payload.is_filterable

        by_id = {option.id: option for option in attribute.options}
        by_value = {option.value: option for option in attribute.options}
        options = []

        for position, item in enumerate(payload.options):
            option = by_id.get(item.id) or by_value.get(item.value)
            if option is None:
                option = AttributeOption(value=item.value)
            option.label = item.label
            option.sort_order = position
            options.append(option)

        attribute.options = options


class CreateAttributeUseCase(SaveAttributeUseCase):
    """Добавить атрибут в справочник."""

    async def execute(self, payload: AttributeCreateSchema) -> Attribute:
        """Вернуть новый атрибут. Ошибки — InvalidAttributeError."""

        if await self.attributes.slug_taken(payload.slug):
            raise InvalidAttributeError(f"Адрес «{payload.slug}» уже занят другим атрибутом")

        self.check_options(payload.type, payload.options)

        attribute = Attribute(slug=payload.slug, type=payload.type, options=[])
        self.fill(attribute, payload)

        return await self.attributes.add(attribute)


class UpdateAttributeUseCase(SaveAttributeUseCase):
    """Изменить название, единицу, фильтр и варианты атрибута."""

    async def execute(self, attribute: Attribute, payload: AttributeUpdateSchema) -> Attribute:
        """Вернуть изменённый атрибут. Ошибки — InvalidAttributeError."""

        self.check_options(attribute.type, payload.options)
        self.fill(attribute, payload)

        return await self.attributes.save(attribute)


class DeleteAttributeUseCase:
    """Удалить атрибут из справочника, из всех категорий и его значения из объявлений."""

    def __init__(self, attributes: AttributeRepository) -> None:
        self.attributes = attributes

    async def execute(self, attribute: Attribute) -> None:
        """Удалить атрибут."""

        await self.attributes.delete(attribute)
