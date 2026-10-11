"""Счётчик непрочитанных сообщений поддержки.

Revision ID: 0041
Revises: 0040
"""

from alembic import op
import sqlalchemy as sa

revision = "0041"
down_revision = "0040"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "support_threads",
        sa.Column("unread_admin_count", sa.Integer(), server_default="0", nullable=False),
    )
    # Старый флаг не хранит количество: сохраняем одно непрочитанное обращение.
    op.execute("UPDATE support_threads SET unread_admin_count = 1 WHERE unread_for_admin = true")


def downgrade() -> None:
    op.drop_column("support_threads", "unread_admin_count")
