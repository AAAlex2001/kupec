"""Сценарии порядка и удаления категории."""

from app.catalog.models import Category
from app.catalog.services.exceptions import CategoryInUseError
from app.catalog.services.repo import CategoryRepository
from app.catalog.services.tree import CategoryTree
from app.core.uploads import remove_image


class MoveCategoryUseCase:
    """Поменять категорию местами с соседней выше или ниже."""

    def __init__(self, categories: CategoryRepository, tree: CategoryTree) -> None:
        self.categories = categories
        self.tree = tree

    async def execute(self, category: Category, direction: str) -> Category:
        """Вернуть категорию на новом месте. Крайнюю дальше края не двигает."""

        level = list(self.tree.level(category.parent_id))
        index = level.index(category)
        target = index - 1 if direction == "up" else index + 1

        if target < 0 or target >= len(level):
            return category

        level[index], level[target] = level[target], level[index]
        for position, item in enumerate(level):
            item.sort_order = position

        return await self.categories.save(category)


class DeleteCategoryUseCase:
    """Удалить пустую категорию вместе с картинкой."""

    def __init__(self, categories: CategoryRepository, tree: CategoryTree) -> None:
        self.categories = categories
        self.tree = tree

    async def execute(self, category: Category) -> None:
        """Удалить. В категории есть подкатегории или объявления — CategoryInUseError."""

        if self.tree.children_of(category):
            raise CategoryInUseError("Сначала удалите или перенесите подкатегории")

        if await self.categories.has_listings(category.id):
            raise CategoryInUseError("В категории есть объявления — её можно только скрыть")

        image_path = category.image_path
        await self.categories.delete(category)

        if image_path is not None:
            remove_image(image_path)
