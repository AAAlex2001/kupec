"""Комплектность материалов и повторное применение импорта без потери правок."""

import importlib.util
import json
import re
from pathlib import Path

import sqlalchemy as sa

from app.articles.schemas import ArticleSaveSchema
from app.core.html import clean_html

MIGRATIONS = Path(__file__).resolve().parents[1] / "migrations"


def load_migration():
    spec = importlib.util.spec_from_file_location(
        "more_news", MIGRATIONS / "versions" / "0033_more_news.py"
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_news_content_is_complete_and_links_resolve() -> None:
    items = load_migration().load_articles()
    old = [
        json.loads(path.read_text(encoding="utf-8"))
        for path in (MIGRATIONS / "data" / "articles_v1").glob("*.json")
    ]
    old_slugs = {item["slug"] for item in old}
    slugs = {item["slug"] for item in items}
    assert len(items) == len(slugs) == 20
    assert not slugs & old_slugs
    assert len({item["title"] for item in items}) == 20
    assert len({item["seo_description"] for item in items}) == 20

    for item in items:
        ArticleSaveSchema.model_validate(
            {**item, "section": "news", "html": item["content"], "publish": True}
        )
        html = clean_html(item["content"])
        assert len(re.findall(r"<h2>", html)) >= 4
        assert len(re.findall(r"\S+", re.sub(r"<[^>]+>", " ", html))) >= 180
        for slug in re.findall(r'href="/news/([^"#?]+)', html):
            assert slug in slugs | old_slugs


def test_news_import_preserves_existing_articles_and_does_not_duplicate(monkeypatch) -> None:
    migration = load_migration()
    engine = sa.create_engine("sqlite://")
    with engine.begin() as connection:
        columns = ", ".join(
            f"{column.name} TEXT" for column in migration.articles.columns
        )
        connection.execute(sa.text(f"CREATE TABLE articles ({columns})"))
        existing_slug = migration.load_articles()[0]["slug"]
        connection.execute(
            sa.text("INSERT INTO articles (slug, title) VALUES (:slug, :title)"),
            {"slug": existing_slug, "title": "Редакторская версия"},
        )
        monkeypatch.setattr(migration.op, "get_bind", lambda: connection)
        monkeypatch.setattr(
            migration.op, "bulk_insert", lambda table, rows: connection.execute(table.insert(), rows)
        )

        migration.upgrade()
        migration.upgrade()

        assert connection.scalar(sa.text("SELECT count(*) FROM articles")) == 20
        assert connection.scalar(
            sa.text("SELECT title FROM articles WHERE slug = :slug"), {"slug": existing_slug}
        ) == "Редакторская версия"
        assert connection.scalar(
            sa.text("SELECT count(*) FROM articles WHERE status = 'published' AND section = 'news'")
        ) == 19
    engine.dispose()
