"""Проверка значений атрибутов объявления. Новый тип — новая функция в PARSERS."""

from collections.abc import Callable
from math import isfinite
from typing import Any

from app.attributes.models import Attribute, AttributeType
from app.attributes.services.fields import CategoryField

NUMBER_MAX = 1_000_000_000
TEXT_MAX_LENGTH = 200


def parse_number(attribute: Attribute, value: Any) -> float:
    """Число от 0 до миллиарда."""

    if isinstance(value, bool) or not isinstance(value, int | float):
        raise ValueError("Введите число")

    if value < 0 or value > NUMBER_MAX or not isfinite(value):
        raise ValueError("Число вне допустимых границ")

    return value


def parse_select(attribute: Attribute, value: Any) -> str:
    """Один вариант из списка атрибута."""

    if not isinstance(value, str) or value not in {option.value for option in attribute.options}:
        raise ValueError("Выберите вариант из списка")

    return value


def parse_multiselect(attribute: Attribute, value: Any) -> list[str]:
    """Несколько вариантов из списка без повторов, в порядке выбора."""

    if not isinstance(value, list):
        raise ValueError("Выберите варианты из списка")

    allowed = {option.value for option in attribute.options}
    if any(not isinstance(item, str) or item not in allowed for item in value):
        raise ValueError("Выберите варианты из списка")

    return list(dict.fromkeys(value))


def parse_boolean(attribute: Attribute, value: Any) -> bool:
    """Да или нет."""

    if not isinstance(value, bool):
        raise ValueError("Ответьте «да» или «нет»")

    return value


def parse_text(attribute: Attribute, value: Any) -> str:
    """Короткий текст без пробелов по краям."""

    if not isinstance(value, str) or len(value.strip()) > TEXT_MAX_LENGTH:
        raise ValueError(f"Не длиннее {TEXT_MAX_LENGTH} символов")

    return value.strip()


PARSERS: dict[str, Callable[[Attribute, Any], Any]] = {
    AttributeType.NUMBER: parse_number,
    AttributeType.SELECT: parse_select,
    AttributeType.MULTISELECT: parse_multiselect,
    AttributeType.BOOLEAN: parse_boolean,
    AttributeType.TEXT: parse_text,
}


def is_empty(value: Any) -> bool:
    """Значение не заполнено: нет, пустая строка или пустой список."""

    return value is None or value == "" or value == []


def clean_values(
    fields: list[CategoryField], raw: dict[str, Any], publish: bool
) -> tuple[dict[str, Any], dict[str, str]]:
    """Проверенные значения по атрибутам категории и ошибки по полям «attributes.<адрес>».

    Атрибуты не из этой категории отбрасываются. Обязательные проверяются только при публикации.
    """

    values: dict[str, Any] = {}
    errors: dict[str, str] = {}

    for field in fields:
        attribute = field.attribute
        value = raw.get(attribute.slug)
        key = f"attributes.{attribute.slug}"

        if is_empty(value):
            if publish and field.is_required:
                errors[key] = f"Заполните «{attribute.name}»"
            continue

        try:
            values[attribute.slug] = PARSERS[attribute.type](attribute, value)
        except ValueError as error:
            errors[key] = f"{attribute.name}: {error}"

    return values, errors
