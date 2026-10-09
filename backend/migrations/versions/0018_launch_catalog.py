"""launch catalog

Каталог запуска из неизменного снимка migrations/data/launch_catalog_v1.json:
категории, атрибуты с вариантами, единицы цены и их привязки. Импорт только добавляет.

Revision ID: 0018
Revises: 0017
Create Date: 2026-10-09
"""

from typing import Sequence, Union

from alembic import op

from migrations.data.launch_catalog_v1 import apply_catalog

revision: str = "0018"
down_revision: Union[str, None] = "0017"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    apply_catalog(op.get_bind())


def downgrade() -> None:
    """Данные каталога не удаляются: на них уже могут ссылаться объявления и правки из админки."""
