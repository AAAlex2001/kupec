"""Фитнес: миграция сохраняет настройки админки, формы и обложки доступны."""

from pathlib import Path

import sqlalchemy as sa
from PIL import Image

from migrations.data import launch_catalog_v1 as launch
from migrations.data.fitness_catalog_v1 import apply_catalog, load_catalog


def test_fitness_migration_is_additive_and_repeatable() -> None:
    metadata = sa.MetaData()
    for clause in (
        launch.categories, launch.attributes, launch.attribute_options,
        launch.category_attributes, launch.units, launch.category_units,
    ):
        sa.Table(clause.name, metadata, *[
            sa.Column(
                column.name, column.type,
                primary_key=column.name == "id",
                unique=column.name in {"slug", "code"},
            )
            for column in clause.c
        ])
    engine = sa.create_engine("sqlite://")
    metadata.create_all(engine)
    with engine.begin() as connection:
        original = launch.load_catalog()
        launch.insert_categories(connection, original)
        launch.insert_attributes(connection, original)
        launch.insert_units(connection, original)
        connection.execute(launch.categories.update().where(
            launch.categories.c.slug == "services"
        ).values(name="Мои услуги", sort_order=42))
        apply_catalog(connection)
        counts = [connection.scalar(sa.select(sa.func.count()).select_from(table))
                  for table in metadata.tables.values()]
        connection.execute(launch.categories.update().where(
            launch.categories.c.slug == "personal-training"
        ).values(name="Тренер", is_active=False))
        apply_catalog(connection)
        assert counts == [connection.scalar(sa.select(sa.func.count()).select_from(table))
                          for table in metadata.tables.values()]
        rows = {row.slug: row for row in connection.execute(sa.select(launch.categories))}
        assert rows["services"].name == "Мои услуги"
        assert rows["services"].sort_order == 42
        assert rows["personal-training"].name == "Тренер"
        assert rows["personal-training"].is_active is False
        assert rows["fitness-training"].parent_id == rows["services"].id
        for slug in ("personal-training", "group-training", "yoga-pilates"):
            assert rows[slug].parent_id == rows["fitness-training"].id
            assert rows[slug].kind == "service"
            codes = set(connection.scalars(sa.select(launch.units.c.code).join(
                launch.category_units, launch.units.c.id == launch.category_units.c.unit_id
            ).where(launch.category_units.c.category_id == rows[slug].id)))
            assert codes == {"training", "hour", "fitness-membership"}
        field_slugs = set(connection.scalars(sa.select(launch.attributes.c.slug).join(
            launch.category_attributes,
            launch.attributes.c.id == launch.category_attributes.c.attribute_id,
        ).where(launch.category_attributes.c.category_id == rows["fitness-training"].id)))
        assert {"training-discipline", "training-goal", "training-location",
                "service-format", "session-minutes"} == field_slugs
    engine.dispose()


def test_fitness_catalog_has_transparent_covers_and_valid_fields() -> None:
    data = launch.validate_catalog(load_catalog())
    assets = Path(__file__).resolve().parents[1] / "assets" / "category-images"
    for category in data["categories"]:
        if category["slug"] == "services":
            continue
        with Image.open(assets / f"{category['slug']}.webp") as image:
            assert image.mode == "RGBA"
            assert image.getextrema()[3][0] == 0
            assert image.width >= 256
            assert image.height >= 256
