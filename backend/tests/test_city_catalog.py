"""Каталог населённых пунктов: полнота, сохранение старых ID, удаление дублей и поиск."""

import asyncio
from collections import Counter

import pytest
import sqlalchemy as sa
from sqlalchemy.orm import Session

from app.cities.models import City
from app.cities.services.catalog import LEGACY_REGION, ImportResult, load_catalog, sync_catalog
from app.cities.services.repo import CityRepository


@pytest.fixture(scope="module")
def catalog() -> list[dict]:
    return load_catalog()


@pytest.fixture
def database():
    """SQLite с таблицей cities и ссылками на неё из объявлений и профилей."""

    engine = sa.create_engine("sqlite://")
    metadata = sa.MetaData()
    cities = sa.Table(
        "cities",
        metadata,
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String),
        sa.Column("region", sa.String),
        sa.Column("district", sa.String),
        sa.Column("settlement_type", sa.String),
        sa.Column("kladr_code", sa.String, unique=True),
        sa.Column("sort_order", sa.Integer),
    )
    sa.Table("listings", metadata, sa.Column("id", sa.Integer, primary_key=True), sa.Column("city_id", sa.Integer))
    sa.Table("users", metadata, sa.Column("id", sa.Integer, primary_key=True), sa.Column("city_id", sa.Integer))
    metadata.create_all(engine)

    with engine.begin() as connection:
        yield connection, cities

    engine.dispose()


def legacy(city_id: int, name: str, district: str | None, sort_order: int = 100) -> dict:
    """Старый иркутский пункт без кода КЛАДР."""

    return {"id": city_id, "name": name, "region": LEGACY_REGION, "district": district, "sort_order": sort_order}


def place(code: str, name: str, district: str, kind: str) -> dict:
    """Запись каталога в Иркутской области."""

    return {
        "kladr_code": code,
        "name": name,
        "region": LEGACY_REGION,
        "district": district,
        "settlement_type": kind,
        "sort_order": 100,
    }


def name_of(connection, cities, city_id: int) -> str | None:
    return connection.execute(sa.select(cities.c.name).where(cities.c.id == city_id)).scalar()


def test_catalog_covers_country_and_requested_regions(catalog: list[dict]) -> None:
    counts = Counter(row["region"] for row in catalog)

    assert len(catalog) > 150_000
    assert len(counts) == 89
    assert counts["Ленинградская область"] >= 3000
    assert counts["Московская область"] >= 6000
    assert len({row["kladr_code"] for row in catalog}) == len(catalog)
    assert all(row["name"] and row["region"] and row["settlement_type"] for row in catalog)


def test_catalog_contains_small_settlements_and_federal_cities(catalog: list[dict]) -> None:
    places = {(row["name"], row["region"]) for row in catalog}

    assert ("Москва", "Москва") in places
    assert ("Санкт-Петербург", "Санкт-Петербург") in places
    assert ("Абрамова Гора", "Ленинградская область") in places
    assert ("Власиха", "Московская область") in places


def test_full_import_keeps_old_ids_and_is_repeatable(database, catalog: list[dict]) -> None:
    connection, cities = database
    connection.execute(
        cities.insert(),
        [
            legacy(7, "Ангарск", None, 2),
            legacy(42, "Баклаши", "Шелеховский муниципальный округ"),
            legacy(43, "Ключевая", "Ангарский городской округ"),
            legacy(99, "Старый локальный пункт", "Местный район"),
        ],
    )

    result = sync_catalog(connection, catalog)
    codes = dict(connection.execute(sa.select(cities.c.kladr_code, cities.c.id)).all())

    assert result == ImportResult(added=len(catalog) - 3, matched=3, removed=0)
    assert [name_of(connection, cities, city_id) for city_id in (7, 42, 43, 99)] == [
        "Ангарск",
        "Баклаши",
        "Ключевая",
        "Старый локальный пункт",
    ]
    assert sync_catalog(connection, catalog) == ImportResult(added=0, matched=0, removed=0)
    assert dict(connection.execute(sa.select(cities.c.kladr_code, cities.c.id)).all()) == codes


def test_ambiguous_old_place_is_removed_only_when_unused(database) -> None:
    connection, cities = database
    connection.execute(cities.insert(), [legacy(5, "Ивановка", "Первый район"), legacy(6, "Азей", "Тулунский район")])
    connection.execute(sa.text("INSERT INTO listings (id, city_id) VALUES (1, 6)"))
    rows = [
        place("3800100000100", "Ивановка", "Первый район", "Село"),
        place("3800100000200", "Ивановка", "Первый район", "Деревня"),
        place("3800200000100", "Азей", "Тулунский район", "Деревня"),
        place("3800200000200", "Азей", "Тулунский район", "Поселок"),
    ]

    result = sync_catalog(connection, rows)

    assert result == ImportResult(added=4, matched=0, removed=1)
    assert name_of(connection, cities, 5) is None
    assert name_of(connection, cities, 6) == "Азей"


def test_search_filters_regions_normalizes_yo_and_escapes_wildcards() -> None:
    engine = sa.create_engine("sqlite://")
    with engine.connect() as connection:
        connection.connection.driver_connection.create_function(
            "lower", 1, lambda value: value.lower(), deterministic=True
        )
    City.__table__.create(engine)

    with Session(engine) as session:
        session.add_all(
            [
                City(name="Орёл", region="Орловская область", settlement_type="Город", sort_order=30),
                City(name="Ивановка", region="Московская область", settlement_type="Село", sort_order=100),
                City(name="Ивановка", region="Ленинградская область", settlement_type="Деревня", sort_order=100),
            ]
        )
        session.commit()

        class AsyncSession:
            """Синхронная сессия под видом асинхронной для репозитория."""

            async def execute(self, statement):
                return session.execute(statement)

        repository = CityRepository(AsyncSession())
        moscow = asyncio.run(repository.search("Иван", 20, "Московская область"))

        assert [row.name for row in asyncio.run(repository.search("ОРЕ", 20))] == ["Орёл"]
        assert len(asyncio.run(repository.search("Иван", 20))) == 2
        assert [row.region for row in moscow] == ["Московская область"]
        assert asyncio.run(repository.search("%", 20)) == []
        assert asyncio.run(repository.regions()) == [
            "Ленинградская область",
            "Московская область",
            "Орловская область",
        ]

    engine.dispose()
