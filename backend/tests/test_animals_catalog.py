"""Животные: полное дерево, корректные формы и единицы цены."""

from pathlib import Path

from migrations.data.animals_catalog_v1 import load_catalog
from migrations.data.launch_catalog_v1 import validate_catalog


def test_animals_catalog_has_complete_tree_and_matching_images() -> None:
    data = validate_catalog(load_catalog())
    categories = {item["slug"]: item for item in data["categories"]}
    assert categories["animals"]["parent"] is None
    assert categories["animals"]["name"] == "Животные"
    assert len(categories) == 8
    assets = Path(__file__).resolve().parents[1] / "assets" / "category-images"
    for category in categories.values():
        assert category["units"]
        assert "?" not in category["name"]
        assert (assets / f"{category['slug']}.webp").is_file()
        if category["slug"] != "animals":
            assert category["parent"] == "animals"


def test_animal_forms_distinguish_animals_from_supplies() -> None:
    data = load_catalog()
    categories = {item["slug"]: item for item in data["categories"]}
    assert "head" in categories["farm-animals"]["units"]
    assert "animal-vaccinated" in categories["dogs"]["attributes"]
    assert "animal-sex" not in categories["pet-supplies"]["attributes"]
    assert {"kg", "pack"} <= set(categories["pet-supplies"]["units"])
