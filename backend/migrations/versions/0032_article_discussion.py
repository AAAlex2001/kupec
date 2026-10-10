"""article discussion

Обсуждение статей: комментарий привязан к посту или к статье — ровно к одному из двух,
лайки статей и счётчики, уведомление об ответе ведёт на статью.

Revision ID: 0032
Revises: 0031
Create Date: 2026-10-11
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0032"
down_revision: Union[str, None] = "0031"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "articles", sa.Column("likes_count", sa.Integer(), nullable=False, server_default="0")
    )
    op.add_column(
        "articles", sa.Column("comments_count", sa.Integer(), nullable=False, server_default="0")
    )

    op.create_table(
        "article_likes",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("article_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["article_id"], ["articles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", "article_id"),
    )
    op.create_index("ix_article_likes_article_id", "article_likes", ["article_id"])

    op.alter_column("post_comments", "post_id", existing_type=sa.Integer(), nullable=True)
    op.add_column("post_comments", sa.Column("article_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "post_comments_article_id_fkey",
        "post_comments",
        "articles",
        ["article_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_check_constraint(
        "ck_post_comments_target", "post_comments", "(post_id IS NULL) <> (article_id IS NULL)"
    )
    op.create_index("ix_post_comments_article_id", "post_comments", ["article_id"])
    op.create_index(
        "ix_post_comments_article_roots",
        "post_comments",
        ["article_id", "created_at", "id"],
        postgresql_where=sa.text("parent_id IS NULL"),
    )

    op.add_column("notifications", sa.Column("article_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "notifications_article_id_fkey",
        "notifications",
        "articles",
        ["article_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_index("ix_notifications_article_id", "notifications", ["article_id"])


def downgrade() -> None:
    op.drop_index("ix_notifications_article_id", table_name="notifications")
    op.drop_constraint("notifications_article_id_fkey", "notifications", type_="foreignkey")
    op.drop_column("notifications", "article_id")

    op.execute("DELETE FROM post_comments WHERE article_id IS NOT NULL")
    op.drop_index("ix_post_comments_article_roots", table_name="post_comments")
    op.drop_index("ix_post_comments_article_id", table_name="post_comments")
    op.drop_constraint("ck_post_comments_target", "post_comments", type_="check")
    op.drop_constraint("post_comments_article_id_fkey", "post_comments", type_="foreignkey")
    op.drop_column("post_comments", "article_id")
    op.alter_column("post_comments", "post_id", existing_type=sa.Integer(), nullable=False)

    op.drop_index("ix_article_likes_article_id", table_name="article_likes")
    op.drop_table("article_likes")
    op.drop_column("articles", "comments_count")
    op.drop_column("articles", "likes_count")
