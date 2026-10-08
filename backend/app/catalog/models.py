from enum import StrEnum

from sqlalchemy import CheckConstraint, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ListingKind(StrEnum):
    """Что предлагают в объявлении: товар или услугу."""

    PRODUCT = "product"
    SERVICE = "service"


class Category(Base):
    """Категория объявлений: соленья, грибы, массаж, репетиторы и так далее."""

    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    kind: Mapped[str] = mapped_column(String(16))
    slug: Mapped[str] = mapped_column(String(100), unique=True)
    name: Mapped[str] = mapped_column(String(100))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    __table_args__ = (
        CheckConstraint("kind IN ('product', 'service')", name="ck_categories_kind"),
    )
