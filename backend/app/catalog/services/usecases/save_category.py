"""Общее для создания и правки категории: проверки адреса и родителя."""

from app.catalog.models import Category
from app.catalog.services.exceptions import InvalidCategoryError
from app.catalog.services.repo import CategoryRepository
from app.catalog.services.tree import CategoryTree


class SaveCategoryUseCase:
    """Проверить адрес и родителя категории."""

    def __init__(self, categories: CategoryRepository, tree: CategoryTree) -> None:
        self.categories = categories
        self.tree = tree

    async def check_slug(self, slug: str, category_id: int | None) -> None:
        """Адрес свободен. Иначе — InvalidCategoryError."""

        if await self.categories.slug_taken(slug, category_id):
            raise InvalidCategoryError(f"Адрес «{slug}» уже занят другой категорией")

    async def check_parent(self, parent_id: int | None) -> Category | None:
        """Родитель, в который можно положить подкатегорию. None — верхний уровень."""

        if parent_id is None:
            return None

        parent = self.tree.by_id.get(parent_id)
        if parent is None:
            raise InvalidCategoryError("Родительской категории нет")

        if await self.categories.has_listings(parent.id):
            raise InvalidCategoryError(
                f"В «{parent.name}» есть объявления — сначала перенесите их в подкатегорию"
            )

        return parent

    def next_position(self, parent_id: int | None) -> int:
        """Место в конце уровня."""

        return max((category.sort_order for category in self.tree.level(parent_id)), default=-1) + 1
