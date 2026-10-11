"""russia settlements

Каталог населённых пунктов России из КЛАДР ФНС от 02.10.2026: регион, тип и код у каждого пункта.
Старые иркутские пункты сохраняют ID и привязки, неиспользуемые старые дубли удаляются.
Отката нет: новые пункты к этому моменту уже могут быть в объявлениях и профилях.

Revision ID: 0037
Revises: 0036
Create Date: 2026-10-12
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.cities.services.catalog import LEGACY_REGION, load_catalog, sync_catalog

revision: str = "0037"
down_revision: Union[str, None] = "0036"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SEARCH_NAME = "replace(lower(name), 'ё', 'е')"


def upgrade() -> None:
    rows = load_catalog()

    op.add_column(
        "cities",
        sa.Column("region", sa.String(100), nullable=False, server_default=LEGACY_REGION),
    )
    op.alter_column("cities", "district", type_=sa.String(255), existing_type=sa.String(100))
    op.add_column("cities", sa.Column("settlement_type", sa.String(100), nullable=True))
    op.add_column("cities", sa.Column("kladr_code", sa.String(13), nullable=True))
    op.drop_constraint("uq_cities_name_district", "cities", type_="unique")
    op.create_unique_constraint("uq_cities_kladr_code", "cities", ["kladr_code"])

    sync_catalog(op.get_bind(), rows)

    op.alter_column("cities", "region", server_default=None)
    op.add_column(
        "cities",
        sa.Column(
            "search_name", sa.String(100), sa.Computed(SEARCH_NAME, persisted=True), nullable=False
        ),
    )
    op.create_index(
        "ix_cities_search_name",
        "cities",
        ["search_name"],
        postgresql_ops={"search_name": "varchar_pattern_ops"},
    )
    op.create_index(
        "ix_cities_region_search",
        "cities",
        ["region", "search_name"],
        postgresql_ops={"search_name": "varchar_pattern_ops"},
    )
    op.create_index("ix_cities_sort", "cities", ["sort_order", "name"])


def downgrade() -> None:
    raise RuntimeError("Каталог населённых пунктов не откатывается: на новые пункты уже могут ссылаться объявления")
