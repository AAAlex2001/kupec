"""Полнота городского пакета, права на обложки и безопасная повторная загрузка."""

import hashlib
import html
import importlib.util
import json
import re
from pathlib import Path

from PIL import Image
import pytest
import sqlalchemy as sa

from app.articles.schemas import ArticleSaveSchema
from app.core.html import clean_html

ROOT = Path(__file__).resolve().parents[1]


def load_migration(filename="0038_city_news.py"):
    spec = importlib.util.spec_from_file_location(
        "city_news", ROOT / "migrations" / "versions" / filename
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def visible(value: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", value))


@pytest.mark.parametrize(
    "filename, expected", [("0038_city_news.py", 70), ("0040_more_city_news.py", 30)]
)
def test_city_news_are_complete_unique_and_have_licensed_covers(filename, expected) -> None:
    migration = load_migration(filename)
    items = migration.load_articles()
    plan = json.loads((migration.DATA / "editorial-plan.json").read_text(encoding="utf-8"))
    old = [
        json.loads(path.read_text(encoding="utf-8"))
        for path in (ROOT / "migrations" / "data" / "articles_v1").glob("*.json")
    ]
    old += json.loads((ROOT / "migrations" / "data" / "articles_v2.json").read_text(encoding="utf-8"))
    if expected == 30:
        old += load_migration().load_articles()
    slugs = {item["slug"] for item in items}
    assert len(items) == len(slugs) == expected
    assert not slugs & {item["slug"] for item in old}
    assert {item["city"] for item in items} == {item["city"] for item in plan}
    assert len({item["title"] for item in items}) == expected
    assert len({item["seo_description"] for item in items}) == expected
    paragraphs = set()
    images = set()
    for item in items:
        ArticleSaveSchema.model_validate(
            {**item, "section": "news", "html": item["content"], "publish": True}
        )
        content = clean_html(item["content"])
        assert 7000 <= len(visible(content)) <= 9000, item["slug"]
        assert len(re.findall(r"<h2>", content)) >= 6, item["slug"]
        city_word = re.split(r"[-\s]", item["city"])[0]
        city_stem = city_word[:3] if len(city_word) > 3 else city_word[:-1]
        if city_word == "Орёл":
            city_stem = "Ор"
        assert city_stem.casefold().replace("ё", "е") in item["title"].casefold().replace("ё", "е"), item["slug"]
        source = item["cover_source"]
        if source.get("type") == "generated":
            assert source["tool"] == "imagegen"
            assert source["prompt"]
        else:
            assert source["page_url"].startswith("https://commons.wikimedia.org/"), item["slug"]
            assert any(value in source["license"].lower() for value in ("cc by", "cc0", "public domain"))
            assert source["page_url"] in html.unescape(content)
        cover = ROOT / "assets" / "article-covers" / f"{item['slug']}.webp"
        with Image.open(cover) as photo:
            assert photo.width >= 1000 and photo.height >= 500, item["slug"]
        digest = hashlib.sha256(cover.read_bytes()).hexdigest()
        assert digest not in images, item["slug"]
        images.add(digest)
        for paragraph in re.findall(r"<p>(.*?)</p>", item["content"], flags=re.S):
            text = visible(paragraph).strip()
            if len(text) > 250:
                assert text not in paragraphs, (item["slug"], text[:80])
                paragraphs.add(text)
        for target in re.findall(r'href="/news/([^"#?]+)', content):
            assert target in slugs | {article["slug"] for article in old}, target


@pytest.mark.parametrize(
    "filename, expected", [("0038_city_news.py", 70), ("0040_more_city_news.py", 30)]
)
def test_city_news_migration_preserves_edits_and_is_idempotent(monkeypatch, filename, expected) -> None:
    migration = load_migration(filename)
    engine = sa.create_engine("sqlite://")
    with engine.begin() as connection:
        columns = ", ".join(f"{column.name} TEXT" for column in migration.articles.columns)
        connection.execute(sa.text(f"CREATE TABLE articles ({columns})"))
        existing = migration.load_articles()[0]["slug"]
        connection.execute(
            sa.text("INSERT INTO articles (slug, title) VALUES (:slug, :title)"),
            {"slug": existing, "title": "Правка редактора"},
        )
        monkeypatch.setattr(migration.op, "get_bind", lambda: connection)
        monkeypatch.setattr(
            migration.op, "bulk_insert", lambda table, rows: connection.execute(table.insert(), rows)
        )
        migration.upgrade()
        migration.upgrade()
        assert connection.scalar(sa.text("SELECT count(*) FROM articles")) == expected
        assert connection.scalar(
            sa.text("SELECT title FROM articles WHERE slug = :slug"), {"slug": existing}
        ) == "Правка редактора"
        monkeypatch.setattr(migration.op, "execute", connection.execute)
        migration.downgrade()
        assert connection.scalar(sa.text("SELECT count(*) FROM articles")) == 0
    engine.dispose()
