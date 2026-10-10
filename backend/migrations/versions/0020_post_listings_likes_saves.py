"""post listings, likes and saves

Revision ID: 0020
Revises: 0019
Create Date: 2026-10-10
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0020"
down_revision: Union[str, None] = "0019"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "posts", sa.Column("likes_count", sa.Integer(), nullable=False, server_default="0")
    )

    op.create_table(
        "post_listings",
        sa.Column("post_id", sa.Integer(), nullable=False),
        sa.Column("listing_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["listing_id"], ["listings.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("post_id", "listing_id"),
    )
    op.create_index(op.f("ix_post_listings_listing_id"), "post_listings", ["listing_id"])

    op.create_table(
        "post_likes",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("post_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", "post_id"),
    )
    op.create_index(op.f("ix_post_likes_post_id"), "post_likes", ["post_id"])

    op.create_table(
        "post_saves",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("post_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", "post_id"),
    )
    op.create_index(op.f("ix_post_saves_post_id"), "post_saves", ["post_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_post_saves_post_id"), table_name="post_saves")
    op.drop_table("post_saves")
    op.drop_index(op.f("ix_post_likes_post_id"), table_name="post_likes")
    op.drop_table("post_likes")
    op.drop_index(op.f("ix_post_listings_listing_id"), table_name="post_listings")
    op.drop_table("post_listings")
    op.drop_column("posts", "likes_count")
