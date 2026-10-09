from enum import StrEnum

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.uploads import image_url


class ListingKind(StrEnum):
    """Что предлагают в объявлении: товар или услугу."""

    PRODUCT = "product"
    SERVICE = "service"


class Category(Base):
    """Категория объявлений. Категории образуют дерево любой глубины через parent_id.

    Объявление крепится только к категории без подкатегорий. Скрытая категория прячет всю свою ветку.
    """

    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"), index=True
    )
    kind: Mapped[str] = mapped_column(String(16))
    slug: Mapped[str] = mapped_column(String(100), unique=True)
    name: Mapped[str] = mapped_column(String(100))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    image_path: Mapped[str | None] = mapped_column(String(500))

    __table_args__ = (
        CheckConstraint("kind IN ('product', 'service')", name="ck_categories_kind"),
    )

    @property
    def image_url(self) -> str | None:
        """Адрес картинки для плитки."""

        return image_url(self.image_path)
