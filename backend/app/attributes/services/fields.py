"""Атрибуты, которые действуют в категории, с наследованием от родителей."""

from dataclasses import dataclass

from app.attributes.models import Attribute, CategoryAttribute


@dataclass
class CategoryField:
    """Атрибут в категории: сам атрибут и обязателен ли он здесь."""

    attribute: Attribute
    is_required: bool


def category_fields(path_ids: list[int], bindings: list[CategoryAttribute]) -> list[CategoryField]:
    """Атрибуты по пути от корня к категории: сначала родительские, потом свои.

    Если атрибут привязан и к родителю, и ниже, «обязателен» берётся с нижнего уровня.
    """

    depth = {category_id: index for index, category_id in enumerate(path_ids)}
    ordered = sorted(bindings, key=lambda binding: (depth[binding.category_id], binding.sort_order))

    fields: dict[int, CategoryField] = {}
    for binding in ordered:
        fields[binding.attribute_id] = CategoryField(binding.attribute, binding.is_required)

    return list(fields.values())
