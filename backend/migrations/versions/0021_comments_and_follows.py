"""post comments, comment likes and follows

Revision ID: 0021
Revises: 0020
Create Date: 2026-10-10
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0021"
down_revision: Union[str, None] = "0020"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "posts", sa.Column("comments_count", sa.Integer(), nullable=False, server_default="0")
    )

    op.create_table(
        "post_comments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("post_id", sa.Integer(), nullable=False),
        sa.Column("author_id", sa.Integer(), nullable=False),
        sa.Column("parent_id", sa.Integer(), nullable=True),
        sa.Column("reply_to_id", sa.Integer(), nullable=True),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("likes_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["parent_id"], ["post_comments.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reply_to_id"], ["post_comments.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_post_comments_post_id"), "post_comments", ["post_id"])
    op.create_index(op.f("ix_post_comments_author_id"), "post_comments", ["author_id"])
    op.create_index(op.f("ix_post_comments_parent_id"), "post_comments", ["parent_id"])

    op.create_table(
        "comment_likes",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("comment_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["comment_id"], ["post_comments.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", "comment_id"),
    )
    op.create_index(op.f("ix_comment_likes_comment_id"), "comment_likes", ["comment_id"])

    op.create_table(
        "follows",
        sa.Column("follower_id", sa.Integer(), nullable=False),
        sa.Column("author_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["follower_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("follower_id", "author_id"),
    )
    op.create_index(op.f("ix_follows_author_id"), "follows", ["author_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_follows_author_id"), table_name="follows")
    op.drop_table("follows")
    op.drop_index(op.f("ix_comment_likes_comment_id"), table_name="comment_likes")
    op.drop_table("comment_likes")
    op.drop_index(op.f("ix_post_comments_parent_id"), table_name="post_comments")
    op.drop_index(op.f("ix_post_comments_author_id"), table_name="post_comments")
    op.drop_index(op.f("ix_post_comments_post_id"), table_name="post_comments")
    op.drop_table("post_comments")
    op.drop_column("posts", "comments_count")
