"""create unique listing views per visitor and day

Revision ID: 0009
Revises: 0008
Create Date: 2026-10-08
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0009"
down_revision: Union[str, None] = "0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "listing_views",
        sa.Column("listing_id", sa.Integer(), nullable=False),
        sa.Column("visitor", sa.String(length=64), nullable=False),
        sa.Column("viewed_on", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(["listing_id"], ["listings.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("listing_id", "visitor", "viewed_on"),
    )


def downgrade() -> None:
    op.drop_table("listing_views")
