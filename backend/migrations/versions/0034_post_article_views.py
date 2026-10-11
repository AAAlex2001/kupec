"""post and article views

Просмотры постов и статей: счётчики и учёт «один посетитель — один просмотр в сутки», как у объявлений.

Revision ID: 0034
Revises: 0033
Create Date: 2026-10-11
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0034"
down_revision: Union[str, None] = "0033"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "posts", sa.Column("views_count", sa.Integer(), nullable=False, server_default="0")
    )
    op.add_column(
        "articles", sa.Column("views_count", sa.Integer(), nullable=False, server_default="0")
    )

    op.create_table(
        "post_views",
        sa.Column("post_id", sa.Integer(), nullable=False),
        sa.Column("visitor", sa.String(length=64), nullable=False),
        sa.Column("viewed_on", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("post_id", "visitor", "viewed_on"),
    )
    op.create_table(
        "article_views",
        sa.Column("article_id", sa.Integer(), nullable=False),
        sa.Column("visitor", sa.String(length=64), nullable=False),
        sa.Column("viewed_on", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(["article_id"], ["articles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("article_id", "visitor", "viewed_on"),
    )


def downgrade() -> None:
    op.drop_table("article_views")
    op.drop_table("post_views")
    op.drop_column("articles", "views_count")
    op.drop_column("posts", "views_count")
