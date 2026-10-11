"""Обложки статей: комплектность и безопасный повторный импорт."""

import asyncio
import json
from pathlib import Path
from types import SimpleNamespace

from PIL import Image

from scripts import import_article_covers as covers


def test_every_seed_article_has_wide_cover() -> None:
    data = Path(__file__).resolve().parents[1] / "migrations" / "data"
    initial = [
        json.loads(path.read_text(encoding="utf-8"))
        for path in (data / "articles_v1").glob("*.json")
    ]
    new = json.loads((data / "articles_v2.json").read_text(encoding="utf-8"))
    city_articles = [
        json.loads(path.read_text(encoding="utf-8"))
        for path in (data / "articles_v3").glob("*.json")
        if path.name != "editorial-plan.json"
    ]
    initial_slugs = {item["slug"] for item in [*initial, *new]}
    slugs = initial_slugs | {item["slug"] for item in city_articles}
    assert len(slugs) == 100
    assert slugs == {path.stem for path in covers.ASSETS.glob("*.webp")}
    for slug in slugs:
        with Image.open(covers.ASSETS / f"{slug}.webp") as image:
            assert image.width >= 1000
            assert 1.1 <= image.width / image.height <= 2.7
            if slug in initial_slugs:
                assert image.width >= 1200
                assert image.width * 9 == image.height * 16
            assert image.mode == "RGB"


def test_import_keeps_admin_cover_and_is_repeatable(monkeypatch) -> None:
    articles = [
        SimpleNamespace(slug="first", cover_path=None),
        SimpleNamespace(slug="second", cover_path="articles/custom.webp"),
    ]
    copied = []

    def copy(source):
        copied.append(source)
        return f"articles/{source.stem}.webp"

    class Session:
        async def execute(self, statement):
            return SimpleNamespace(scalars=lambda: SimpleNamespace(all=lambda: articles))

        async def commit(self):
            pass

    monkeypatch.setattr(covers, "copy_to_media", copy)
    sources = {slug: Path(f"{slug}.webp") for slug in ("first", "second")}
    assert asyncio.run(covers.import_covers(Session(), sources)) == ["first"]
    assert asyncio.run(covers.import_covers(Session(), sources)) == []
    assert copied == [Path("first.webp")]
    assert articles[1].cover_path == "articles/custom.webp"


def test_cover_copy_is_content_addressed_and_stays_in_media(tmp_path, monkeypatch) -> None:
    source = tmp_path / "source.webp"
    source.write_bytes(b"cover-v1")
    media = tmp_path / "media"
    monkeypatch.setattr(covers, "get_settings", lambda: SimpleNamespace(media_dir=media))

    first = covers.copy_to_media(source)
    assert covers.copy_to_media(source) == first
    assert (media / first).read_bytes() == b"cover-v1"
    assert len(list((media / "articles").iterdir())) == 1

    source.write_bytes(b"cover-v2")
    second = covers.copy_to_media(source)
    assert second != first
    assert (media / second).read_bytes() == b"cover-v2"
