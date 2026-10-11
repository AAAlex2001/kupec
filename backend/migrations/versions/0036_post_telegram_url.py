"""post telegram url

Ссылка на пост в Telegram-канале автора: показывается на сайте у поста.

Revision ID: 0036
Revises: 0035
Create Date: 2026-10-12
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0036"
down_revision: Union[str, None] = "0035"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("posts", sa.Column("telegram_url", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("posts", "telegram_url")
