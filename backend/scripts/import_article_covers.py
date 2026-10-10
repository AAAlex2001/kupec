"""Привязать обложки первых статей из assets/article-covers, сохранив обложки из админки."""

import asyncio
import hashlib
from pathlib import Path
from shutil import copyfile

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.articles.models import Article
from app.core.config import get_settings
from app.core.database import SessionLocal, engine

ASSETS = Path(__file__).resolve().parents[1] / "assets" / "article-covers"


def copy_to_media(source: Path) -> str:
    """Имя по содержимому: повторный импорт не плодит копии."""

    digest = hashlib.sha256(source.read_bytes()).hexdigest()[:16]
    path = f"articles/{source.stem}-{digest}.webp"
    target = Path(get_settings().media_dir) / path
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        copyfile(source, target)
    return path


async def import_covers(session: AsyncSession, sources: dict[str, Path]) -> list[str]:
    """Заполнить только пустые обложки существующих статей."""

    result = await session.execute(select(Article).where(Article.slug.in_(sources)))
    imported = []
    for article in result.scalars().all():
        if article.cover_path is None:
            article.cover_path = copy_to_media(sources[article.slug])
            imported.append(article.slug)
    await session.commit()
    return imported


async def main() -> None:
    sources = {source.stem: source for source in sorted(ASSETS.glob("*.webp"))}
    async with SessionLocal() as session:
        imported = await import_covers(session, sources)
    await engine.dispose()
    print(f"Обложек статей добавлено: {len(imported)}. {', '.join(imported)}")


if __name__ == "__main__":
    asyncio.run(main())
