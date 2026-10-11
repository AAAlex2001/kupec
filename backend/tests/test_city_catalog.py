"""Справочник населённых пунктов: полнота файла и поиск по началу названия."""

import asyncio
import importlib.util
from collections import Counter
from pathlib import Path

import sqlalchemy as sa
from sqlalchemy.orm import Session

from app.cities.models import City
from app.cities.services.repo import CityRepository

MIGRATION = Path(__file__).resolve().parents[1] / "migrations" / "versions" / "0037_russia_settlements.py"


def load_places() -> list[dict]:
    """Пункты из файла справочника тем же способом, что и в миграции."""

    spec = importlib.util.spec_from_file_location("russia_settlements", MIGRATION)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    return module.load_places()


def test_places_cover_whole_country() -> None:
    places = load_places()
    regions = Counter(row["region"] for row in places)
    names = {(row["name"], row["region"]) for row in places}

    assert len(places) > 150_000
    assert len(regions) == 89
    assert regions["Московская область"] >= 6000
    assert regions["Ленинградская область"] >= 3000
    assert ("Москва", "Москва") in names
    assert ("Санкт-Петербург", "Санкт-Петербург") in names
    assert ("Ангарск", "Иркутская область") in names
    assert len({row["kladr_code"] for row in places}) == len(places)


def test_search_normalizes_yo_and_escapes_wildcards() -> None:
    engine = sa.create_engine("sqlite://")
    with engine.connect() as connection:
        connection.connection.driver_connection.create_function(
            "lower", 1, lambda value: value.lower(), deterministic=True
        )
    City.__table__.create(engine)

    with Session(engine) as session:
        session.add_all(
            [
                City(name="Орёл", region="Орловская область", sort_order=30),
                City(name="Ивановка", region="Московская область", sort_order=100),
                City(name="Ивановка", region="Ленинградская область", sort_order=100),
            ]
        )
        session.commit()

        class AsyncSession:
            """Синхронная сессия под видом асинхронной для репозитория."""

            async def execute(self, statement):
                return session.execute(statement)

        repository = CityRepository(AsyncSession())

        assert [row.name for row in asyncio.run(repository.search("ОРЕ", 20))] == ["Орёл"]
        assert len(asyncio.run(repository.search("Иван", 20))) == 2
        assert asyncio.run(repository.search("%", 20)) == []

    engine.dispose()
