"""russia settlements

Населённые пункты всей России из справочника КЛАДР ФНС от 02.10.2026 (data/russia_cities.csv.gz).
У пунктов появляются регион, тип и код КЛАДР. Прежние пункты были иркутскими — им проставляется
«Иркутская область». Прежние пункты не из справочника, на которые не ссылаются объявления
и профили, удаляются: вместо них есть такие же из справочника.

Revision ID: 0037
Revises: 0036
Create Date: 2026-10-12
"""

import csv
import gzip
from pathlib import Path
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import insert

revision: str = "0037"
down_revision: Union[str, None] = "0036"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "russia_cities.csv.gz"
PREVIOUS_REGION = "Иркутская область"
BATCH_SIZE = 1000

cities = sa.table(
    "cities",
    sa.column("kladr_code", sa.String),
    sa.column("name", sa.String),
    sa.column("region", sa.String),
    sa.column("district", sa.String),
    sa.column("settlement_type", sa.String),
    sa.column("sort_order", sa.Integer),
)

UNUSED_OLD_CITIES = """
    DELETE FROM cities
    WHERE kladr_code IS NULL
      AND id NOT IN (SELECT city_id FROM listings WHERE city_id IS NOT NULL)
      AND id NOT IN (SELECT city_id FROM users WHERE city_id IS NOT NULL)
"""


def load_places() -> list[dict]:
    """Пункты из файла справочника."""

    with gzip.open(DATA_FILE, "rt", encoding="utf-8", newline="") as stream:
        return [
            {**row, "district": row["district"] or None, "sort_order": int(row["sort_order"])}
            for row in csv.DictReader(stream)
        ]


def add_places(rows: list[dict]) -> None:
    """Добавить пункты пачками. Уже добавленные по коду КЛАДР пропускаются."""

    for start in range(0, len(rows), BATCH_SIZE):
        batch = rows[start : start + BATCH_SIZE]
        op.execute(insert(cities).values(batch).on_conflict_do_nothing(index_elements=["kladr_code"]))


def upgrade() -> None:
    op.add_column(
        "cities",
        sa.Column("region", sa.String(100), nullable=False, server_default=PREVIOUS_REGION),
    )
    op.alter_column("cities", "region", server_default=None)
    op.alter_column("cities", "district", type_=sa.String(255), existing_type=sa.String(100))
    op.add_column("cities", sa.Column("settlement_type", sa.String(100), nullable=True))
    op.add_column("cities", sa.Column("kladr_code", sa.String(13), nullable=True))
    op.drop_constraint("uq_cities_name_district", "cities", type_="unique")
    op.create_unique_constraint("uq_cities_kladr_code", "cities", ["kladr_code"])

    add_places(load_places())
    op.execute(UNUSED_OLD_CITIES)

    op.add_column(
        "cities",
        sa.Column(
            "search_name",
            sa.String(100),
            sa.Computed("replace(lower(name), 'ё', 'е')", persisted=True),
            nullable=False,
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
    raise RuntimeError("Справочник населённых пунктов не откатывается: на новые пункты уже ссылаются объявления")
