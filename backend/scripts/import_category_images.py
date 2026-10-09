"""Начальные картинки плиток: копирует их из assets в media и привязывает к категориям.

Запуск из backend после миграций: python -m scripts.import_category_images
Картинки, которые уже заданы в админке, не трогает.
"""

import asyncio
import hashlib
from pathlib import Path
from shutil import copyfile

from sqlalchemy import select

from app.catalog.models import Category
from app.core.config import get_settings
from app.core.database import SessionLocal, engine

ASSETS = Path(__file__).resolve().parents[1] / "assets" / "category-images"
FOLDER = "categories"


def copy_to_media(source: Path) -> str:
    """Скопировать картинку в media под именем с хешем содержимого. Возвращает путь внутри media."""

    digest = hashlib.sha256(source.read_bytes()).hexdigest()[:16]
    path = f"{FOLDER}/{source.stem}-{digest}.webp"

    target = Path(get_settings().media_dir) / path
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        copyfile(source, target)

    return path


async def main() -> None:
    """Привязать картинку к каждой категории с тем же адресом, у которой картинки ещё нет."""

    sources = {source.stem: source for source in sorted(ASSETS.glob("*.webp"))}

    async with SessionLocal() as session:
        result = await session.execute(select(Category).where(Category.slug.in_(sources)))
        categories = list(result.scalars().all())

        imported = []
        for category in categories:
            if category.image_path is None:
                category.image_path = copy_to_media(sources[category.slug])
                imported.append(category.slug)

        await session.commit()

    await engine.dispose()

    missing = sorted(set(sources) - {category.slug for category in categories})
    print(f"Привязано картинок: {len(imported)}. {', '.join(imported)}")
    if missing:
        print(f"Нет категорий с адресом: {', '.join(missing)}")


if __name__ == "__main__":
    asyncio.run(main())
