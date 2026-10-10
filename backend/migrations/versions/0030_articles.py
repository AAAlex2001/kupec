"""articles

Статьи блога и новости: текст из редактора, обложка, поля для поисковиков.

Revision ID: 0030
Revises: 0029
Create Date: 2026-10-11
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0030"
down_revision: Union[str, None] = "0029"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "articles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("section", sa.String(length=16), nullable=False),
        sa.Column("slug", sa.String(length=150), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=False),
        sa.Column("html", sa.Text(), nullable=False),
        sa.Column("cover_path", sa.String(length=500), nullable=True),
        sa.Column("seo_title", sa.String(length=120), nullable=False),
        sa.Column("seo_description", sa.String(length=300), nullable=False),
        sa.Column("seo_keywords", sa.String(length=500), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
        sa.CheckConstraint("section IN ('blog', 'news')", name="ck_articles_section"),
        sa.CheckConstraint("status IN ('draft', 'published')", name="ck_articles_status"),
    )
    op.create_index(
        "ix_articles_feed",
        "articles",
        ["section", sa.text("published_at DESC"), sa.text("id DESC")],
        postgresql_where=sa.text("status = 'published'"),
    )
    op.create_index(
        "ix_articles_admin",
        "articles",
        ["section", sa.text("updated_at DESC"), sa.text("id DESC")],
    )


def downgrade() -> None:
    op.drop_index("ix_articles_admin", table_name="articles")
    op.drop_index("ix_articles_feed", table_name="articles")
    op.drop_table("articles")
