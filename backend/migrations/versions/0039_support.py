"""support

Чат с поддержкой: переписка посетителя (гость или пользователь), сообщения и фото к ним.

Revision ID: 0039
Revises: 0038
Create Date: 2026-10-12
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0039"
down_revision: Union[str, None] = "0038"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "support_threads",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("visitor", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("unread_for_admin", sa.Boolean(), nullable=False),
        sa.Column("unread_for_visitor", sa.Integer(), nullable=False),
        sa.Column("preview", sa.String(length=200), nullable=False),
        sa.Column("last_message_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("visitor"),
    )
    op.create_index("ix_support_threads_user_id", "support_threads", ["user_id"])
    op.create_index("ix_support_threads_last_message_at", "support_threads", ["last_message_at"])

    op.create_table(
        "support_messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("thread_id", sa.Integer(), nullable=False),
        sa.Column("from_admin", sa.Boolean(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["thread_id"], ["support_threads.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_support_messages_thread_id", "support_messages", ["thread_id"])

    op.create_table(
        "support_photos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("message_id", sa.Integer(), nullable=False),
        sa.Column("path", sa.String(length=500), nullable=False),
        sa.ForeignKeyConstraint(["message_id"], ["support_messages.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_support_photos_message_id", "support_photos", ["message_id"])


def downgrade() -> None:
    op.drop_table("support_photos")
    op.drop_table("support_messages")
    op.drop_table("support_threads")
