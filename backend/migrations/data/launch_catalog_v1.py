"""Каталог запуска: категории, атрибуты с вариантами и единицы цены из неизменного снимка.

Импорт только добавляет: существующие категории, атрибуты, варианты и привязки остаются как есть.
"""

import json
from pathlib import Path

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import insert

SNAPSHOT = Path(__file__).with_name("launch_catalog_v1.json")

categories = sa.table(
    "categories",
    sa.column("id", sa.Integer),
    sa.column("parent_id", sa.Integer),
    sa.column("slug", sa.String),
    sa.column("name", sa.String),
    sa.column("kind", sa.String),
    sa.column("sort_order", sa.Integer),
    sa.column("is_active", sa.Boolean),
)
attributes = sa.table(
    "attributes",
    sa.column("id", sa.Integer),
    sa.column("slug", sa.String),
    sa.column("name", sa.String),
    sa.column("type", sa.String),
    sa.column("unit", sa.String),
    sa.column("is_filterable", sa.Boolean),
)
attribute_options = sa.table(
    "attribute_options",
    sa.column("attribute_id", sa.Integer),
    sa.column("value", sa.String),
    sa.column("label", sa.String),
    sa.column("sort_order", sa.Integer),
)
category_attributes = sa.table(
    "category_attributes",
    sa.column("category_id", sa.Integer),
    sa.column("attribute_id", sa.Integer),
    sa.column("is_required", sa.Boolean),
    sa.column("sort_order", sa.Integer),
)
units = sa.table(
    "units",
    sa.column("id", sa.Integer),
    sa.column("code", sa.String),
    sa.column("label", sa.String),
    sa.column("kind", sa.String),
    sa.column("sort_order", sa.Integer),
)
category_units = sa.table(
    "category_units",
    sa.column("category_id", sa.Integer),
    sa.column("unit_id", sa.Integer),
    sa.column("sort_order", sa.Integer),
)
listings = sa.table("listings", sa.column("category_id", sa.Integer))


def load_catalog() -> dict:
    """Снимок каталога из JSON рядом с этим файлом."""

    return json.loads(SNAPSHOT.read_text(encoding="utf-8"))


def check_category(category: dict, known: dict, attribute_slugs: set, unit_kinds: dict) -> None:
    """Родитель стоит раньше и того же типа, атрибуты и единицы существуют. Иначе — ValueError."""

    parent = known.get(category["parent"]) if category["parent"] else None
    if category["parent"] and (parent is None or parent["kind"] != category["kind"]):
        raise ValueError(f"Неверный родитель категории «{category['slug']}»")

    if any(slug not in attribute_slugs for slug in category["attributes"]):
        raise ValueError(f"Неизвестный атрибут в категории «{category['slug']}»")

    if any(unit_kinds.get(code) != category["kind"] for code in category["units"]):
        raise ValueError(f"Неверная единица цены в категории «{category['slug']}»")


def check_attribute(attribute: dict) -> None:
    """Варианты без пустых и повторов, у списков они есть, текст не фильтруется."""

    values = [option["value"] for option in attribute["options"]]

    if len(values) != len(set(values)) or not all(values):
        raise ValueError(f"Неверные варианты атрибута «{attribute['slug']}»")

    if attribute["type"] in ("select", "multiselect") and not values:
        raise ValueError(f"У атрибута-списка «{attribute['slug']}» нет вариантов")

    if attribute["type"] == "text" and attribute["is_filterable"]:
        raise ValueError(f"Текстовый атрибут «{attribute['slug']}» не может быть фильтром")


def validate_catalog(data: dict) -> dict:
    """Проверить снимок целиком. Ошибка — ValueError с адресом категории или атрибута."""

    attribute_slugs = {attribute["slug"] for attribute in data["attributes"]}
    unit_kinds = {unit["code"]: unit["kind"] for unit in data["units"]}

    if len(attribute_slugs) != len(data["attributes"]) or len(unit_kinds) != len(data["units"]):
        raise ValueError("Адреса атрибутов или коды единиц повторяются")

    known: dict[str, dict] = {}
    for category in data["categories"]:
        if category["slug"] in known:
            raise ValueError(f"Адрес категории «{category['slug']}» повторяется")
        check_category(category, known, attribute_slugs, unit_kinds)
        known[category["slug"]] = category

    for attribute in data["attributes"]:
        check_attribute(attribute)

    return data


def add_if_missing(connection: sa.Connection, table: sa.TableClause, values: dict, key: str) -> int | None:
    """Добавить строку, если такого ключа ещё нет. Вернуть id новой строки или None."""

    stmt = (
        insert(table)
        .values(**values)
        .on_conflict_do_nothing(index_elements=[key])
        .returning(table.c.id)
    )

    return connection.execute(stmt).scalar_one_or_none()


def next_position(connection: sa.Connection, column: sa.ColumnClause, condition) -> int:
    """Следующий порядковый номер после самого большого под условием."""

    last = connection.scalar(sa.select(sa.func.max(column)).where(condition))

    return (last if last is not None else -1) + 1


def insert_categories(connection: sa.Connection, data: dict) -> dict[str, int]:
    """Добавить новые категории. Вернуть id всех категорий по адресам."""

    ids = dict(connection.execute(sa.select(categories.c.slug, categories.c.id)).all())

    for category in data["categories"]:
        values = {
            "slug": category["slug"],
            "name": category["name"],
            "kind": category["kind"],
            "sort_order": category["sort_order"],
            "parent_id": ids[category["parent"]] if category["parent"] else None,
            "is_active": True,
        }
        new_id = add_if_missing(connection, categories, values, "slug")
        if new_id is not None:
            ids[category["slug"]] = new_id

    return ids


def insert_options(connection: sa.Connection, attribute_id: int, options: list[dict]) -> None:
    """Добавить в конец списка варианты, которых у атрибута ещё нет."""

    owned = attribute_options.c.attribute_id == attribute_id
    existing = set(connection.scalars(sa.select(attribute_options.c.value).where(owned)))
    position = next_position(connection, attribute_options.c.sort_order, owned)

    for option in options:
        if option["value"] in existing:
            continue
        connection.execute(
            attribute_options.insert().values(
                attribute_id=attribute_id,
                value=option["value"],
                label=option["label"],
                sort_order=position,
            )
        )
        position += 1


def insert_attributes(connection: sa.Connection, data: dict) -> dict[str, int]:
    """Добавить новые атрибуты и недостающие варианты. Вернуть id всех атрибутов по адресам."""

    rows = connection.execute(sa.select(attributes.c.slug, attributes.c.id, attributes.c.type)).all()
    ids = {row.slug: row.id for row in rows}
    types = {row.slug: row.type for row in rows}

    for attribute in data["attributes"]:
        values = {
            "slug": attribute["slug"],
            "name": attribute["name"],
            "type": attribute["type"],
            "unit": attribute["unit"],
            "is_filterable": attribute["is_filterable"],
        }
        new_id = add_if_missing(connection, attributes, values, "slug")
        if new_id is not None:
            ids[attribute["slug"]] = new_id
            types[attribute["slug"]] = attribute["type"]

        if types[attribute["slug"]] != attribute["type"]:
            raise ValueError(f"Тип атрибута «{attribute['slug']}» в базе другой")

        insert_options(connection, ids[attribute["slug"]], attribute["options"])

    return ids


def insert_units(connection: sa.Connection, data: dict) -> dict[str, int]:
    """Добавить новые единицы в конец списка своего типа. Вернуть id всех единиц по кодам."""

    ids = dict(connection.execute(sa.select(units.c.code, units.c.id)).all())

    for unit in data["units"]:
        position = next_position(connection, units.c.sort_order, units.c.kind == unit["kind"])
        values = {**unit, "sort_order": position}
        new_id = add_if_missing(connection, units, values, "code")
        if new_id is not None:
            ids[unit["code"]] = new_id

    return ids


def bind_attributes(connection: sa.Connection, category_id: int, attribute_ids: list[int]) -> None:
    """Привязать к категории атрибуты, которых у неё ещё нет, в конец списка."""

    owned = category_attributes.c.category_id == category_id
    existing = set(connection.scalars(sa.select(category_attributes.c.attribute_id).where(owned)))
    position = next_position(connection, category_attributes.c.sort_order, owned)

    for attribute_id in attribute_ids:
        if attribute_id in existing:
            continue
        connection.execute(
            category_attributes.insert().values(
                category_id=category_id,
                attribute_id=attribute_id,
                is_required=False,
                sort_order=position,
            )
        )
        position += 1


def bind_units(connection: sa.Connection, category_id: int, unit_ids: list[int]) -> None:
    """Привязать к категории единицы, которых у неё ещё нет, в конец списка."""

    owned = category_units.c.category_id == category_id
    existing = set(connection.scalars(sa.select(category_units.c.unit_id).where(owned)))
    position = next_position(connection, category_units.c.sort_order, owned)

    for unit_id in unit_ids:
        if unit_id in existing:
            continue
        connection.execute(
            category_units.insert().values(
                category_id=category_id,
                unit_id=unit_id,
                sort_order=position,
            )
        )
        position += 1


def move_root_listings(connection: sa.Connection, data: dict, category_ids: dict[str, int]) -> None:
    """Объявления, лежащие прямо в разделе, перенести в его подкатегорию «Другое»."""

    for root, fallback in data["root_fallbacks"].items():
        connection.execute(
            listings.update()
            .where(listings.c.category_id == category_ids[root])
            .values(category_id=category_ids[fallback])
        )


def move_bindings(
    connection: sa.Connection,
    data: dict,
    category_ids: dict[str, int],
    attribute_ids: dict[str, int],
) -> None:
    """Перенести привязку атрибута из раздела в его подкатегорию, сохранив «обязательный»."""

    for move in data["move_bindings"]:
        source_id = category_ids[move["from"]]
        target_id = category_ids[move["to"]]
        attribute_id = attribute_ids[move["attribute"]]
        source = (category_attributes.c.category_id == source_id) & (
            category_attributes.c.attribute_id == attribute_id
        )

        old = connection.execute(sa.select(category_attributes).where(source)).mappings().first()
        if old is None:
            continue

        connection.execute(
            insert(category_attributes)
            .values(
                category_id=target_id,
                attribute_id=attribute_id,
                is_required=old["is_required"],
                sort_order=old["sort_order"],
            )
            .on_conflict_do_update(
                index_elements=["category_id", "attribute_id"],
                set_={"is_required": old["is_required"]},
            )
        )
        connection.execute(category_attributes.delete().where(source))


def apply_catalog(connection: sa.Connection) -> None:
    """Проверить снимок и добавить из него всё, чего ещё нет в базе."""

    data = validate_catalog(load_catalog())

    category_ids = insert_categories(connection, data)
    attribute_ids = insert_attributes(connection, data)
    unit_ids = insert_units(connection, data)

    for category in data["categories"]:
        category_id = category_ids[category["slug"]]
        bind_attributes(connection, category_id, [attribute_ids[slug] for slug in category["attributes"]])
        bind_units(connection, category_id, [unit_ids[code] for code in category["units"]])

    move_root_listings(connection, data, category_ids)
    move_bindings(connection, data, category_ids, attribute_ids)
