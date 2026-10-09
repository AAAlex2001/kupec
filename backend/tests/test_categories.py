"""Тесты дерева категорий и сценариев админки без БД."""

import asyncio

import pytest

from app.catalog.models import Category, ListingKind
from app.catalog.schemas import CategoryCreateSchema, CategoryUpdateSchema
from app.catalog.services.exceptions import CategoryInUseError, InvalidCategoryError
from app.catalog.services.tree import CategoryTree
from app.catalog.services.usecases.create_category import CreateCategoryUseCase
from app.catalog.services.usecases.manage_category import (
    DeleteCategoryUseCase,
    MoveCategoryUseCase,
)
from app.catalog.services.usecases.update_category import UpdateCategoryUseCase


def category(id: int, slug: str, parent_id: int | None = None, **fields) -> Category:
    """Категория с типом «товар», видимая, первая в уровне."""

    return Category(
        id=id,
        parent_id=parent_id,
        kind=fields.get("kind", ListingKind.PRODUCT),
        slug=slug,
        name=slug.capitalize(),
        sort_order=fields.get("sort_order", 0),
        is_active=fields.get("is_active", True),
    )


def make_tree() -> CategoryTree:
    """Продукты → Дары леса → Грибы, Ягоды; Массаж — услуга на верхнем уровне."""

    return CategoryTree(
        [
            category(1, "food"),
            category(2, "forest", parent_id=1),
            category(3, "mushrooms", parent_id=2, sort_order=0),
            category(4, "berries", parent_id=2, sort_order=1),
            category(5, "massage", kind=ListingKind.SERVICE, sort_order=1),
        ]
    )


class FakeCategoryRepository:
    """Категории из дерева; объявления есть только в указанных категориях."""

    def __init__(self, tree: CategoryTree, with_listings: set[int] | None = None) -> None:
        self.tree = tree
        self.with_listings = with_listings or set()
        self.deleted: list[Category] = []

    async def slug_taken(self, slug: str, exclude_id: int | None) -> bool:
        return any(item.slug == slug and item.id != exclude_id for item in self.tree.categories)

    async def has_listings(self, category_id: int) -> bool:
        return category_id in self.with_listings

    async def add(self, item: Category) -> Category:
        item.id = 100
        return item

    async def save(self, item: Category) -> Category:
        return item

    async def delete(self, item: Category) -> None:
        self.deleted.append(item)


def test_roots_and_children_keep_given_order() -> None:
    tree = make_tree()

    assert [item.slug for item in tree.roots()] == ["food", "massage"]
    assert [item.slug for item in tree.level(2)] == ["mushrooms", "berries"]


def test_branch_includes_all_levels_below() -> None:
    tree = make_tree()

    assert sorted(tree.branch_ids(tree.by_id[1])) == [1, 2, 3, 4]
    assert tree.branch_ids(tree.by_id[3]) == [3]


def test_leaves_are_categories_without_children() -> None:
    assert [item.slug for item in make_tree().leaves()] == ["mushrooms", "berries", "massage"]


def test_parents_go_from_root_down() -> None:
    tree = make_tree()

    assert [item.slug for item in tree.parents_of(tree.by_id[4])] == ["food", "forest"]
    assert tree.parents_of(tree.by_id[1]) == []


def test_hidden_category_hides_whole_branch() -> None:
    tree = make_tree()
    tree.by_id[2].is_active = False

    active = tree.active()

    assert [item.slug for item in active.categories] == ["food", "massage"]
    assert active.find("berries") is None


def test_subcategory_takes_kind_from_parent_and_goes_last() -> None:
    tree = make_tree()
    usecase = CreateCategoryUseCase(FakeCategoryRepository(tree), tree)
    payload = CategoryCreateSchema(
        parent_id=2, kind=ListingKind.SERVICE, slug="nuts", name="Орехи"
    )

    created = asyncio.run(usecase.execute(payload))

    assert created.kind == ListingKind.PRODUCT
    assert created.sort_order == 2


def test_taken_slug_and_parent_with_listings_are_rejected() -> None:
    tree = make_tree()
    usecase = CreateCategoryUseCase(FakeCategoryRepository(tree, with_listings={3}), tree)

    with pytest.raises(InvalidCategoryError):
        asyncio.run(usecase.execute(CategoryCreateSchema(slug="berries", name="Ягоды")))

    with pytest.raises(InvalidCategoryError):
        asyncio.run(
            usecase.execute(CategoryCreateSchema(parent_id=3, slug="white", name="Белые"))
        )


def test_category_cannot_move_into_own_branch_or_other_kind() -> None:
    tree = make_tree()
    usecase = UpdateCategoryUseCase(FakeCategoryRepository(tree), tree)
    food = tree.by_id[1]

    def move_to(parent_id: int) -> CategoryUpdateSchema:
        return CategoryUpdateSchema(parent_id=parent_id, slug="food", name="Продукты", is_active=True)

    with pytest.raises(InvalidCategoryError):
        asyncio.run(usecase.execute(food, move_to(3)))

    with pytest.raises(InvalidCategoryError):
        asyncio.run(usecase.execute(tree.by_id[4], move_to(5).model_copy(update={"slug": "berries"})))


def test_move_swaps_with_neighbour_and_stops_at_edge() -> None:
    tree = make_tree()
    usecase = MoveCategoryUseCase(FakeCategoryRepository(tree), tree)
    berries = tree.by_id[4]

    asyncio.run(usecase.execute(berries, "up"))
    assert (berries.sort_order, tree.by_id[3].sort_order) == (0, 1)

    tree = CategoryTree(sorted(tree.categories, key=lambda item: item.sort_order))
    asyncio.run(MoveCategoryUseCase(FakeCategoryRepository(tree), tree).execute(berries, "up"))
    assert berries.sort_order == 0


def test_only_empty_category_is_deleted() -> None:
    tree = make_tree()
    repository = FakeCategoryRepository(tree, with_listings={4})
    usecase = DeleteCategoryUseCase(repository, tree)

    with pytest.raises(CategoryInUseError):
        asyncio.run(usecase.execute(tree.by_id[2]))

    with pytest.raises(CategoryInUseError):
        asyncio.run(usecase.execute(tree.by_id[4]))

    asyncio.run(usecase.execute(tree.by_id[3]))
    assert repository.deleted == [tree.by_id[3]]
