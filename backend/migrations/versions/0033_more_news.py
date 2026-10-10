"""Ещё двадцать практических материалов раздела «Новости».

Revision ID: 0033
Revises: 0032
Create Date: 2026-10-11
"""

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.core.html import clean_html

revision: str = "0033"
down_revision: Union[str, None] = "0032"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

ARTICLES_FILE = Path(__file__).resolve().parents[1] / "data" / "articles_v2.json"
PUBLISHED_AT = datetime(2026, 10, 11, tzinfo=timezone(timedelta(hours=3)))

articles = sa.table(
    "articles",
    sa.column("section", sa.String),
    sa.column("slug", sa.String),
    sa.column("title", sa.String),
    sa.column("description", sa.String),
    sa.column("html", sa.Text),
    sa.column("seo_title", sa.String),
    sa.column("seo_description", sa.String),
    sa.column("seo_keywords", sa.String),
    sa.column("status", sa.String),
    sa.column("published_at", sa.DateTime(timezone=True)),
)


def load_articles() -> list[dict]:
    return json.loads(ARTICLES_FILE.read_text(encoding="utf-8"))


def upgrade() -> None:
    """Добавить новые статьи, сохранив существующие записи и правки редактора."""

    taken = set(op.get_bind().execute(sa.text("SELECT slug FROM articles")).scalars())
    rows = [
        {
            "section": "news",
            "slug": item["slug"],
            "title": item["title"],
            "description": item["description"],
            "html": clean_html(item["content"]),
            "seo_title": item["seo_title"],
            "seo_description": item["seo_description"],
            "seo_keywords": item["seo_keywords"],
            "status": "published",
            "published_at": PUBLISHED_AT,
        }
        for item in load_articles()
        if item["slug"] not in taken
    ]

    if rows:
        op.bulk_insert(articles, rows)


def downgrade() -> None:
    slugs = [item["slug"] for item in load_articles()]
    op.execute(articles.delete().where(articles.c.slug.in_(slugs)))
