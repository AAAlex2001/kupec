"""Сценарии загрузки и удаления картинки категории."""

from fastapi import UploadFile
from sqlalchemy.exc import SQLAlchemyError

from app.catalog.models import Category
from app.catalog.services.repo import CategoryRepository
from app.core.uploads import remove_image, save_image

CATEGORIES_FOLDER = "categories"


class SetCategoryImageUseCase:
    """Загрузить картинку плитки и удалить прежнюю."""

    def __init__(self, categories: CategoryRepository) -> None:
        self.categories = categories

    async def execute(self, category: Category, file: UploadFile) -> Category:
        """Вернуть категорию с новой картинкой. Бросает UploadError, если файл не подходит."""

        path = await save_image(file, CATEGORIES_FOLDER)

        old_path = category.image_path
        category.image_path = path

        try:
            saved = await self.categories.save(category)
        except SQLAlchemyError:
            remove_image(path)
            raise

        if old_path is not None:
            remove_image(old_path)

        return saved


class RemoveCategoryImageUseCase:
    """Убрать картинку плитки."""

    def __init__(self, categories: CategoryRepository) -> None:
        self.categories = categories

    async def execute(self, category: Category) -> Category:
        """Вернуть категорию без картинки."""

        old_path = category.image_path
        category.image_path = None

        saved = await self.categories.save(category)

        if old_path is not None:
            remove_image(old_path)

        return saved
