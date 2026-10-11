"""Повторно импортировать каталог населённых пунктов: существующие ID и привязки сохраняются.

Запуск из backend (или в контейнере): python -m scripts.import_locations
"""

import asyncio

from app.cities.services.catalog import load_catalog, sync_catalog
from app.core.database import engine


async def main() -> None:
    """Сверить базу с каталогом из assets/locations одной транзакцией."""

    rows = load_catalog()
    async with engine.begin() as connection:
        result = await connection.run_sync(sync_catalog, rows)
    await engine.dispose()

    print(
        f"Добавлено: {result.added}. Привязано старых: {result.matched}. "
        f"Удалено неиспользуемых дублей: {result.removed}."
    )


if __name__ == "__main__":
    asyncio.run(main())
