"""Семьдесят городских материалов раздела «Новости».

Revision ID: 0038
Revises: 0037
Create Date: 2026-10-11
"""

import html
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.core.html import clean_html

revision: str = "0038"
down_revision: Union[str, None] = "0037"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DATA = Path(__file__).resolve().parents[1] / "data" / "articles_v3"
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


def cover_credit(source: dict) -> str:
    """Автор и свободная лицензия фотографии остаются видимыми в статье."""
    if source.get("type") == "generated":
        return "<p><em>Иллюстрация создана для Купца.</em></p>"
    page = html.escape(source["page_url"], quote=True)
    author = html.escape(source["author"] or "Wikimedia Commons")
    license_name = html.escape(source["license"])
    license_url = html.escape(source["license_url"], quote=True)
    license_link = (
        f'<a href="{license_url}">{license_name}</a>'
        if license_url
        else license_name
    )
    return (
        f'<p><em>Иллюстрация: <a href="{page}">{author}</a>. '
        f"{license_link}. Фото используется как тематическая иллюстрация.</em></p>"
    )


def load_articles() -> list[dict]:
    items = []
    for path in sorted(DATA.glob("*.json")):
        item = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(item, dict) and "slug" in item:
            item = {**item, "content": item["content"] + cover_credit(item["cover_source"])}
            items.append(item)
    if len(items) != 70 or len({item["slug"] for item in items}) != 70:
        raise ValueError("The city news seed must contain 70 unique complete articles")
    return items


def upgrade() -> None:
    """Опубликовать новые материалы, не меняя статьи, уже отредактированные в админке."""
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
