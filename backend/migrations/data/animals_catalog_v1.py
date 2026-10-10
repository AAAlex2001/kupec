"""Дополнение каталога: животные. Старый снимок запуска остаётся неизменным."""

import json
from pathlib import Path

import sqlalchemy as sa

from migrations.data.launch_catalog_v1 import (
    bind_attributes,
    bind_units,
    insert_attributes,
    insert_categories,
    insert_units,
    validate_catalog,
)


def load_catalog() -> dict:
    return json.loads(Path(__file__).with_suffix(".json").read_text(encoding="utf-8"))


def apply_catalog(connection: sa.Connection) -> None:
    data = validate_catalog(load_catalog())
    category_ids = insert_categories(connection, data)
    attribute_ids = insert_attributes(connection, data)
    unit_ids = insert_units(connection, data)
    for category in data["categories"]:
        category_id = category_ids[category["slug"]]
        bind_attributes(connection, category_id, [attribute_ids[slug] for slug in category["attributes"]])
        bind_units(connection, category_id, [unit_ids[code] for code in category["units"]])
