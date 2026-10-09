"""attributes, listing attribute values and search indexes

Справочник атрибутов с вариантами и привязкой к категориям.
Значения хранятся в listings.attributes (JSONB) с индексом для фильтров «@>».
Поиск: полнотекстовый по-русски и по части названия, оба по индексам.

Revision ID: 0014
Revises: 0013
Create Date: 2026-10-08
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0014"
down_revision: Union[str, None] = "0013"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SEARCH_VECTOR = "to_tsvector('russian', coalesce(title, '') || ' ' || coalesce(description, ''))"


def upgrade() -> None:
    op.create_table(
        "attributes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("type", sa.String(length=16), nullable=False),
        sa.Column("unit", sa.String(length=16), nullable=True),
        sa.Column("is_filterable", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
        sa.CheckConstraint(
            "type IN ('number', 'select', 'multiselect', 'boolean', 'text')",
            name="ck_attributes_type",
        ),
    )

    op.create_table(
        "attribute_options",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("attribute_id", sa.Integer(), nullable=False),
        sa.Column("value", sa.String(length=100), nullable=False),
        sa.Column("label", sa.String(length=100), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["attribute_id"], ["attributes.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("attribute_id", "value", name="uq_attribute_options_value"),
    )
    op.create_index("ix_attribute_options_attribute_id", "attribute_options", ["attribute_id"])

    op.create_table(
        "category_attributes",
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column("attribute_id", sa.Integer(), nullable=False),
        sa.Column("is_required", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("category_id", "attribute_id"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["attribute_id"], ["attributes.id"], ondelete="CASCADE"),
    )
    op.create_index(
        "ix_category_attributes_attribute_id", "category_attributes", ["attribute_id"]
    )

    op.add_column(
        "listings",
        sa.Column(
            "attributes",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
    )
    op.create_index(
        "ix_listings_attributes",
        "listings",
        ["attributes"],
        postgresql_using="gin",
        postgresql_ops={"attributes": "jsonb_path_ops"},
    )

    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.execute(f"CREATE INDEX ix_listings_search ON listings USING gin ({SEARCH_VECTOR})")
    op.execute("CREATE INDEX ix_listings_title_trgm ON listings USING gin (title gin_trgm_ops)")
    op.create_index("ix_listings_price", "listings", ["price"])


def downgrade() -> None:
    op.drop_index("ix_listings_price", table_name="listings")
    op.drop_index("ix_listings_title_trgm", table_name="listings")
    op.drop_index("ix_listings_search", table_name="listings")
    op.drop_index("ix_listings_attributes", table_name="listings")
    op.drop_column("listings", "attributes")
    op.drop_table("category_attributes")
    op.drop_table("attribute_options")
    op.drop_table("attributes")
