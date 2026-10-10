"""ai requests

Запросы к ИИ-помощнику постов — только кто и когда, для лимита запросов в час.

Revision ID: 0028
Revises: 0027
Create Date: 2026-10-11
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0028"
down_revision: Union[str, None] = "0027"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ai_requests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_requests_user_created", "ai_requests", ["user_id", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_ai_requests_user_created", table_name="ai_requests")
    op.drop_table("ai_requests")
