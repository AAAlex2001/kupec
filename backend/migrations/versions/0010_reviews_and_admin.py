"""create reviews, review photos, admin flag and seller rating

Revision ID: 0010
Revises: 0009
Create Date: 2026-10-08
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0010"
down_revision: Union[str, None] = "0009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users", sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.false())
    )
    op.add_column("users", sa.Column("rating", sa.Float(), nullable=False, server_default="0"))
    op.add_column(
        "users", sa.Column("reviews_count", sa.Integer(), nullable=False, server_default="0")
    )

    op.create_table(
        "reviews",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("listing_id", sa.Integer(), nullable=True),
        sa.Column("author_id", sa.Integer(), nullable=False),
        sa.Column("seller_id", sa.Integer(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=True),
        sa.Column("anonymous", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("status", sa.String(length=16), nullable=False, server_default="pending"),
        sa.Column("reject_reason", sa.String(length=300), nullable=True),
        sa.Column("reply_text", sa.Text(), nullable=True),
        sa.Column("reply_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["listing_id"], ["listings.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["seller_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("listing_id", "author_id"),
        sa.CheckConstraint("rating BETWEEN 1 AND 5", name="ck_reviews_rating"),
        sa.CheckConstraint(
            "status IN ('pending', 'published', 'rejected')", name="ck_reviews_status"
        ),
    )
    op.create_index(op.f("ix_reviews_listing_id"), "reviews", ["listing_id"])
    op.create_index(op.f("ix_reviews_author_id"), "reviews", ["author_id"])
    op.create_index(op.f("ix_reviews_seller_id"), "reviews", ["seller_id"])
    op.create_index(op.f("ix_reviews_status"), "reviews", ["status"])

    op.create_table(
        "review_photos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("review_id", sa.Integer(), nullable=True),
        sa.Column("path", sa.String(length=500), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["review_id"], ["reviews.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_review_photos_owner_id"), "review_photos", ["owner_id"])
    op.create_index(op.f("ix_review_photos_review_id"), "review_photos", ["review_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_review_photos_review_id"), table_name="review_photos")
    op.drop_index(op.f("ix_review_photos_owner_id"), table_name="review_photos")
    op.drop_table("review_photos")
    op.drop_index(op.f("ix_reviews_status"), table_name="reviews")
    op.drop_index(op.f("ix_reviews_seller_id"), table_name="reviews")
    op.drop_index(op.f("ix_reviews_author_id"), table_name="reviews")
    op.drop_index(op.f("ix_reviews_listing_id"), table_name="reviews")
    op.drop_table("reviews")
    op.drop_column("users", "reviews_count")
    op.drop_column("users", "rating")
    op.drop_column("users", "is_admin")
