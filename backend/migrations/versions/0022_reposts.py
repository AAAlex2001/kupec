"""reposts

Репост — пост со ссылкой на оригинал. Удалят оригинал — удалятся и репосты.

Revision ID: 0022
Revises: 0021
Create Date: 2026-10-10
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0022"
down_revision: Union[str, None] = "0021"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("posts", sa.Column("repost_of_id", sa.Integer(), nullable=True))
    op.add_column(
        "posts", sa.Column("reposts_count", sa.Integer(), nullable=False, server_default="0")
    )
    op.create_foreign_key(
        "posts_repost_of_id_fkey", "posts", "posts", ["repost_of_id"], ["id"], ondelete="CASCADE"
    )
    op.create_index(op.f("ix_posts_repost_of_id"), "posts", ["repost_of_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_posts_repost_of_id"), table_name="posts")
    op.drop_constraint("posts_repost_of_id_fkey", "posts", type_="foreignkey")
    op.drop_column("posts", "reposts_count")
    op.drop_column("posts", "repost_of_id")
