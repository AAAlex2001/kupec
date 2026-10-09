from sqlalchemy import CheckConstraint, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Unit(Base):
    """Единица цены: «кг», «банка», «час». Справочник ведут в админке.

    Код не меняется после создания: по нему единица хранится в объявлениях.
    """

    __tablename__ = "units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    code: Mapped[str] = mapped_column(String(16), unique=True)
    label: Mapped[str] = mapped_column(String(32))
    kind: Mapped[str] = mapped_column(String(16))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    __table_args__ = (CheckConstraint("kind IN ('product', 'service')", name="ck_units_kind"),)


class CategoryUnit(Base):
    """Единица, доступная в категории. Подкатегория без своих единиц берёт их у родителя."""

    __tablename__ = "category_units"

    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True
    )
    unit_id: Mapped[int] = mapped_column(
        ForeignKey("units.id", ondelete="CASCADE"), primary_key=True, index=True
    )
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    unit: Mapped[Unit] = relationship(lazy="joined")
