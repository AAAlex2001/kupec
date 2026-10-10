"""first articles

Первые статьи раздела «Новости» из migrations/data/articles_v1: по одному JSON-файлу на статью.
Публикуются сразу, в 09:00 по Москве в день из файла. Статьи, чей адрес уже занят, пропускаются,
поэтому правки из админки миграция не затирает. Дальше статьи меняют в «Админка → Статьи».

Revision ID: 0031
Revises: 0030
Create Date: 2026-10-11
"""

import json
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.core.html import clean_html

revision: str = "0031"
down_revision: Union[str, None] = "0030"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

ARTICLES_DIR = Path(__file__).resolve().parents[1] / "data" / "articles_v1"
MOSCOW = timezone(timedelta(hours=3))
PUBLISH_TIME = time(9, 0)

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
    """Статьи из файлов, старые первыми — так у новых будут большие id."""

    items = [
        json.loads(path.read_text(encoding="utf-8")) for path in sorted(ARTICLES_DIR.glob("*.json"))
    ]

    return sorted(items, key=lambda item: item["published_at"])


def upgrade() -> None:
    bind = op.get_bind()
    taken = set(bind.execute(sa.text("SELECT slug FROM articles")).scalars())

    rows = [
        {
            "section": item["section"],
            "slug": item["slug"],
            "title": item["title"],
            "description": item["description"],
            "html": clean_html(item["content"]),
            "seo_title": item["seo_title"],
            "seo_description": item["seo_description"],
            "seo_keywords": item["seo_keywords"],
            "status": "published",
            "published_at": datetime.combine(
                date.fromisoformat(item["published_at"]), PUBLISH_TIME, MOSCOW
            ),
        }
        for item in load_articles()
        if item["slug"] not in taken
    ]

    if rows:
        op.bulk_insert(articles, rows)


def downgrade() -> None:
    slugs = [item["slug"] for item in load_articles()]
    op.execute(articles.delete().where(articles.c.slug.in_(slugs)))
