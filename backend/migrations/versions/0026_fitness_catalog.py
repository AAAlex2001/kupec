"""Фитнес и тренировки: дерево услуг, поля и единицы цены.

Revision ID: 0026
Revises: 0025
"""

from alembic import op

from migrations.data.fitness_catalog_v1 import apply_catalog

revision = "0026"
down_revision = "0025"
branch_labels = None
depends_on = None


def upgrade() -> None:
    apply_catalog(op.get_bind())


def downgrade() -> None:
    """Сохраняем категории и привязки, которые могут использоваться объявлениями."""
