"""units dictionary

Единицы цены переезжают из кода в справочник, который ведут в админке.
Коды прежних единиц сохраняются, поэтому объявления не меняются.
listings.unit ссылается на units.code: единицу из объявлений удалить нельзя.

Revision ID: 0016
Revises: 0015
Create Date: 2026-10-09
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0016"
down_revision: Union[str, None] = "0015"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

UNITS = [
    ("piece", "штука", "product"),
    ("kg", "кг", "product"),
    ("jar", "банка", "product"),
    ("liter", "литр", "product"),
    ("pack", "упаковка", "product"),
    ("hour", "час", "service"),
    ("session", "сеанс", "service"),
    ("service", "услуга", "service"),
    ("day", "день", "service"),
]


def upgrade() -> None:
    units = op.create_table(
        "units",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=16), nullable=False),
        sa.Column("label", sa.String(length=32), nullable=False),
        sa.Column("kind", sa.String(length=16), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
        sa.CheckConstraint("kind IN ('product', 'service')", name="ck_units_kind"),
    )

    positions: dict[str, int] = {}
    rows = []
    for code, label, kind in UNITS:
        positions[kind] = positions.get(kind, -1) + 1
        rows.append({"code": code, "label": label, "kind": kind, "sort_order": positions[kind]})
    op.bulk_insert(units, rows)

    op.create_foreign_key(
        "fk_listings_unit_code", "listings", "units", ["unit"], ["code"], ondelete="RESTRICT"
    )
    op.create_index("ix_listings_unit", "listings", ["unit"])


def downgrade() -> None:
    op.drop_index("ix_listings_unit", table_name="listings")
    op.drop_constraint("fk_listings_unit_code", "listings", type_="foreignkey")
    op.drop_table("units")
