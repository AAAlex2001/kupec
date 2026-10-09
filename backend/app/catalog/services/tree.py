"""Дерево категорий в памяти."""

from app.catalog.models import Category


class CategoryTree:
    """Дерево категорий из одного запроса: справочник маленький, обход в памяти быстрый.

    Порядок категорий внутри уровня — тот, в котором их передали.
    """

    def __init__(self, categories: list[Category]) -> None:
        self.categories = categories
        self.by_slug = {category.slug: category for category in categories}
        self.by_id = {category.id: category for category in categories}
        self.children: dict[int | None, list[Category]] = {}

        for category in categories:
            self.children.setdefault(category.parent_id, []).append(category)

    def find(self, slug: str) -> Category | None:
        """Категория по адресу или None."""

        return self.by_slug.get(slug)

    def level(self, parent_id: int | None) -> list[Category]:
        """Категории одного уровня под этим родителем. None — верхний уровень."""

        return self.children.get(parent_id, [])

    def roots(self) -> list[Category]:
        """Категории верхнего уровня."""

        return self.level(None)

    def children_of(self, category: Category) -> list[Category]:
        """Подкатегории на один уровень ниже."""

        return self.level(category.id)

    def leaves(self) -> list[Category]:
        """Категории без подкатегорий — только к ним крепятся объявления."""

        return [category for category in self.categories if not self.children_of(category)]

    def branch_ids(self, category: Category) -> list[int]:
        """id категории и всех её подкатегорий на любой глубине."""

        ids = []
        stack = [category]

        while stack:
            current = stack.pop()
            ids.append(current.id)
            stack.extend(self.children_of(current))

        return ids

    def parents_of(self, category: Category) -> list[Category]:
        """Родители от корня до ближайшего — для хлебных крошек."""

        parents = []
        parent_id = category.parent_id

        while parent_id is not None:
            parent = self.by_id[parent_id]
            parents.append(parent)
            parent_id = parent.parent_id

        return list(reversed(parents))

    def active(self) -> "CategoryTree":
        """Дерево для сайта: скрытая категория прячет и всю свою ветку."""

        visible_ids = set()
        stack = [category for category in self.roots() if category.is_active]

        while stack:
            current = stack.pop()
            visible_ids.add(current.id)
            stack.extend(child for child in self.children_of(current) if child.is_active)

        return CategoryTree([category for category in self.categories if category.id in visible_ids])
