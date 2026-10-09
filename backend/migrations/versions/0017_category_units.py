"""units available in categories

Какие единицы цены предлагать в категории. Подкатегория без своих берёт их у ближайшего родителя,
а если нигде не заданы — показываются все единицы своего типа.

Revision ID: 0017
Revises: 0016
Create Date: 2026-10-09
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0017"
down_revision: Union[str, None] = "0016"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

BINDINGS = {
    "food": ["kg", "piece", "jar", "liter", "pack"],
    "pickles": ["jar", "kg", "liter"],
    "mushrooms": ["kg", "liter", "jar", "pack"],
    "berries": ["kg", "liter", "jar"],
    "vegetables": ["kg", "piece", "pack"],
    "honey": ["jar", "kg", "liter"],
    "bakery": ["piece", "kg", "pack"],
    "dairy": ["liter", "kg", "piece", "pack"],
    "meat-fish": ["kg", "piece"],
    "services": ["hour", "session", "service", "day"],
    "massage": ["session", "hour"],
    "tutors": ["hour", "session"],
    "moving": ["hour", "service"],
    "clothes": ["piece"],
    "kids": ["piece"],
    "electronics": ["piece"],
    "furniture": ["piece"],
    "auto-parts": ["piece"],
    "hobby": ["piece"],
    "other-goods": ["piece", "pack"],
}

categories = sa.table("categories", sa.column("id", sa.Integer), sa.column("slug", sa.String))
units = sa.table("units", sa.column("id", sa.Integer), sa.column("code", sa.String))


def upgrade() -> None:
    category_units = op.create_table(
        "category_units",
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column("unit_id", sa.Integer(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("category_id", "unit_id"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["unit_id"], ["units.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_category_units_unit_id", "category_units", ["unit_id"])

    connection = op.get_bind()
    category_ids = dict(connection.execute(sa.select(categories.c.slug, categories.c.id)).all())
    unit_ids = dict(connection.execute(sa.select(units.c.code, units.c.id)).all())

    op.bulk_insert(
        category_units,
        [
            {
                "category_id": category_ids[slug],
                "unit_id": unit_ids[code],
                "sort_order": position,
            }
            for slug, codes in BINDINGS.items()
            if slug in category_ids
            for position, code in enumerate(codes)
            if code in unit_ids
        ],
    )


def downgrade() -> None:
    op.drop_table("category_units")
