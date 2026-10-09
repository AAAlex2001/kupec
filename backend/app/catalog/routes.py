from fastapi import APIRouter, Depends, HTTPException, status

from app.attributes.dependencies import get_load_fields_usecase
from app.attributes.schemas import CategoryFieldSchema
from app.attributes.services.usecases.load_fields import LoadCategoryFieldsUseCase
from app.catalog.dependencies import get_category_tree
from app.catalog.schemas import CategoryNodeSchema, CategoryPageSchema, CategorySchema
from app.catalog.services.tree import CategoryTree
from app.units.dependencies import get_load_units_usecase
from app.units.schemas import UnitSchema
from app.units.services.usecases.category_units import LoadCategoryUnitsUseCase

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("")
async def list_categories(
    tree: CategoryTree = Depends(get_category_tree),
) -> list[CategoryNodeSchema]:
    """Всё дерево категорий: верхний уровень с подкатегориями."""

    return [CategoryNodeSchema.from_tree(tree, root) for root in tree.roots()]


@router.get("/{slug}")
async def get_category(
    slug: str,
    tree: CategoryTree = Depends(get_category_tree),
    fields: LoadCategoryFieldsUseCase = Depends(get_load_fields_usecase),
    units: LoadCategoryUnitsUseCase = Depends(get_load_units_usecase),
) -> CategoryPageSchema:
    """Категория для каталога и формы: путь от корня, подкатегории, атрибуты и единицы цены."""

    category = tree.find(slug)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Категория не найдена",
        )

    return CategoryPageSchema(
        category=CategorySchema.model_validate(category),
        parents=[CategorySchema.model_validate(parent) for parent in tree.parents_of(category)],
        children=[CategorySchema.model_validate(child) for child in tree.children_of(category)],
        fields=[CategoryFieldSchema.from_field(field) for field in await fields.execute(tree, category)],
        units=[
            UnitSchema.model_validate(unit)
            for unit in await units.execute(tree, category, category.kind)
        ],
    )
