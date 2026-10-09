from enum import StrEnum

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AttributeType(StrEnum):
    """Тип атрибута: от него зависят поле в форме, проверка значения и фильтр."""

    NUMBER = "number"
    SELECT = "select"
    MULTISELECT = "multiselect"
    BOOLEAN = "boolean"
    TEXT = "text"


TYPES_WITH_OPTIONS = (AttributeType.SELECT, AttributeType.MULTISELECT)


class Attribute(Base):
    """Характеристика объявления: «Вес», «Вид», «Год выпуска». Справочник ведут в админке.

    Адрес и тип после создания не меняются: по адресу значения лежат в объявлениях.
    """

    __tablename__ = "attributes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    slug: Mapped[str] = mapped_column(String(100), unique=True)
    name: Mapped[str] = mapped_column(String(100))
    type: Mapped[str] = mapped_column(String(16))
    unit: Mapped[str | None] = mapped_column(String(16))
    is_filterable: Mapped[bool] = mapped_column(Boolean, default=True)

    options: Mapped[list["AttributeOption"]] = relationship(
        lazy="selectin",
        order_by="AttributeOption.sort_order, AttributeOption.id",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint(
            "type IN ('number', 'select', 'multiselect', 'boolean', 'text')",
            name="ck_attributes_type",
        ),
    )


class AttributeOption(Base):
    """Вариант значения атрибута-списка: «Огурцы», «Томаты». Значение не меняется после создания."""

    __tablename__ = "attribute_options"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    attribute_id: Mapped[int] = mapped_column(
        ForeignKey("attributes.id", ondelete="CASCADE"), index=True
    )
    value: Mapped[str] = mapped_column(String(100))
    label: Mapped[str] = mapped_column(String(100))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    __table_args__ = (
        UniqueConstraint("attribute_id", "value", name="uq_attribute_options_value"),
    )


class CategoryAttribute(Base):
    """Атрибут, привязанный к категории. Действует и во всех её подкатегориях."""

    __tablename__ = "category_attributes"

    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True
    )
    attribute_id: Mapped[int] = mapped_column(
        ForeignKey("attributes.id", ondelete="CASCADE"), primary_key=True, index=True
    )
    is_required: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    attribute: Mapped[Attribute] = relationship(lazy="joined")
