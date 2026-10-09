"""Категории: репозиторий, дерево, сценарии админки и категория по id из пути."""

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.catalog.models import Category
from app.catalog.services.repo import CategoryRepository
from app.catalog.services.tree import CategoryTree
from app.catalog.services.usecases.create_category import CreateCategoryUseCase
from app.catalog.services.usecases.manage_category import (
    DeleteCategoryUseCase,
    MoveCategoryUseCase,
)
from app.catalog.services.usecases.manage_image import (
    RemoveCategoryImageUseCase,
    SetCategoryImageUseCase,
)
from app.catalog.services.usecases.update_category import UpdateCategoryUseCase
from app.core.database import get_session


def get_category_repository(
    session: AsyncSession = Depends(get_session),
) -> CategoryRepository:
    """Репозиторий категорий с сессией текущего запроса."""

    return CategoryRepository(session)


async def get_full_category_tree(
    categories: CategoryRepository = Depends(get_category_repository),
) -> CategoryTree:
    """Всё дерево со скрытыми категориями — для админки. Один запрос."""

    return CategoryTree(await categories.list_all())


def get_category_tree(
    tree: CategoryTree = Depends(get_full_category_tree),
) -> CategoryTree:
    """Дерево для сайта: без скрытых категорий и их веток."""

    return tree.active()


def get_admin_category(
    category_id: int,
    tree: CategoryTree = Depends(get_full_category_tree),
) -> Category:
    """Категория по id из пути, в том числе скрытая. Нет — 404."""

    category = tree.by_id.get(category_id)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Категория не найдена",
        )

    return category


def get_create_category_usecase(
    categories: CategoryRepository = Depends(get_category_repository),
    tree: CategoryTree = Depends(get_full_category_tree),
) -> CreateCategoryUseCase:
    """Сценарий новой категории."""

    return CreateCategoryUseCase(categories, tree)


def get_update_category_usecase(
    categories: CategoryRepository = Depends(get_category_repository),
    tree: CategoryTree = Depends(get_full_category_tree),
) -> UpdateCategoryUseCase:
    """Сценарий правки категории."""

    return UpdateCategoryUseCase(categories, tree)


def get_move_category_usecase(
    categories: CategoryRepository = Depends(get_category_repository),
    tree: CategoryTree = Depends(get_full_category_tree),
) -> MoveCategoryUseCase:
    """Сценарий сдвига категории среди соседних."""

    return MoveCategoryUseCase(categories, tree)


def get_delete_category_usecase(
    categories: CategoryRepository = Depends(get_category_repository),
    tree: CategoryTree = Depends(get_full_category_tree),
) -> DeleteCategoryUseCase:
    """Сценарий удаления категории."""

    return DeleteCategoryUseCase(categories, tree)


def get_set_category_image_usecase(
    categories: CategoryRepository = Depends(get_category_repository),
) -> SetCategoryImageUseCase:
    """Сценарий загрузки картинки категории."""

    return SetCategoryImageUseCase(categories)


def get_remove_category_image_usecase(
    categories: CategoryRepository = Depends(get_category_repository),
) -> RemoveCategoryImageUseCase:
    """Сценарий удаления картинки категории."""

    return RemoveCategoryImageUseCase(categories)
