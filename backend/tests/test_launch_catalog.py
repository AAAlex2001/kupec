"""Тесты снимка каталога запуска: ссылки целые, формы разумные, старые адреса сохранены."""

import pytest

from migrations.data.launch_catalog_v1 import load_catalog, validate_catalog

DATA = load_catalog()
CATEGORIES = {category["slug"]: category for category in DATA["categories"]}
ATTRIBUTES = {attribute["slug"]: attribute for attribute in DATA["attributes"]}
STARTER_ATTRIBUTES = {"condition": "select", "jar-volume": "number", "subject": "multiselect"}
STARTER_CATEGORIES = {"food", "pickles", "services", "tutors", "clothes", "electronics"}


def effective_attributes(slug: str) -> set[str]:
    """Атрибуты категории вместе с атрибутами всех родителей."""

    attributes = set()
    category = CATEGORIES[slug]

    while category is not None:
        attributes |= set(category["attributes"])
        category = CATEGORIES[category["parent"]] if category["parent"] else None

    return attributes


def test_snapshot_is_valid_and_every_section_has_subcategories() -> None:
    validate_catalog(DATA)
    roots = [category for category in DATA["categories"] if category["parent"] is None]

    assert len(roots) == 9
    assert all(any(item["parent"] == root["slug"] for item in DATA["categories"]) for root in roots)


def test_every_category_has_units_and_a_reasonable_form() -> None:
    for category in DATA["categories"]:
        assert category["units"]
        assert 2 <= len(effective_attributes(category["slug"])) <= 14


def test_starter_addresses_and_types_are_kept() -> None:
    assert STARTER_CATEGORIES <= CATEGORIES.keys()

    for slug, attribute_type in STARTER_ATTRIBUTES.items():
        assert ATTRIBUTES[slug]["type"] == attribute_type


def test_filters_match_their_categories() -> None:
    assert "shoe-size" in effective_attributes("women-shoes")
    assert "clothing-size" not in effective_attributes("women-shoes")
    assert {"jar-volume", "pickle-method"} <= effective_attributes("pickles")
    assert {"tyre-width", "wheel-diameter"} <= effective_attributes("tires")


@pytest.mark.parametrize("root, fallback", DATA["root_fallbacks"].items())
def test_listings_from_a_section_move_to_its_leaf(root: str, fallback: str) -> None:
    assert CATEGORIES[fallback]["parent"] == root
    assert CATEGORIES[fallback]["kind"] == CATEGORIES[root]["kind"]
    assert not any(category["parent"] == fallback for category in DATA["categories"])
