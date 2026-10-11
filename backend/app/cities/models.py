from sqlalchemy import Computed, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class City(Base):
    """Населённый пункт с регионом и стабильным кодом справочника ФНС."""

    __tablename__ = "cities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    name: Mapped[str] = mapped_column(String(100))
    region: Mapped[str] = mapped_column(String(100))
    district: Mapped[str | None] = mapped_column(String(255))
    settlement_type: Mapped[str | None] = mapped_column(String(100))
    kladr_code: Mapped[str | None] = mapped_column(String(13), unique=True)
    search_name: Mapped[str] = mapped_column(
        String(100),
        Computed("replace(lower(name), 'ё', 'е')", persisted=True),
    )
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    __table_args__ = (
        Index(
            "ix_cities_search_name",
            "search_name",
            postgresql_ops={"search_name": "varchar_pattern_ops"},
        ),
        Index(
            "ix_cities_region_search",
            "region",
            "search_name",
            postgresql_ops={"search_name": "varchar_pattern_ops"},
        ),
        Index("ix_cities_sort", "sort_order", "name"),
    )
