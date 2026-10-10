"""Категория животных с подкатегориями, характеристиками и единицами цены.

Revision ID: 0025
Revises: 0024
"""

from alembic import op

from migrations.data.animals_catalog_v1 import apply_catalog

revision = "0025"
down_revision = "0024"
branch_labels = None
depends_on = None


def upgrade() -> None:
    apply_catalog(op.get_bind())


def downgrade() -> None:
    """Сохраняем данные: категории могут использоваться объявлениями."""
