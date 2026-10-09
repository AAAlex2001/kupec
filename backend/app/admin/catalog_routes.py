"""Админка каталога: дерево категорий, атрибуты с привязкой к категориям и единицы цены."""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from app.admin.schemas import AdminCategorySchema
from app.attributes.dependencies import (
    get_attribute,
    get_attribute_repository,
    get_bind_attributes_usecase,
    get_create_attribute_usecase,
    get_delete_attribute_usecase,
    get_load_bindings_usecase,
    get_update_attribute_usecase,
)
from app.attributes.models import Attribute
from app.attributes.schemas import (
    AttributeCreateSchema,
    AttributeSchema,
    AttributeUpdateSchema,
    CategoryAttributesSchema,
    CategoryAttributesUpdateSchema,
    CategoryFieldSchema,
    InheritedFieldSchema,
)
from app.attributes.services.exceptions import InvalidAttributeError
from app.attributes.services.fields import CategoryField
from app.attributes.services.repo import AttributeRepository
from app.attributes.services.usecases.bind_attributes import BindAttributesUseCase
from app.attributes.services.usecases.load_bindings import LoadBindingsUseCase
from app.attributes.services.usecases.save_attribute import (
    CreateAttributeUseCase,
    DeleteAttributeUseCase,
    UpdateAttributeUseCase,
)
from app.auth.dependencies import require_admin
from app.catalog.dependencies import (
    get_admin_category,
    get_category_repository,
    get_create_category_usecase,
    get_delete_category_usecase,
    get_full_category_tree,
    get_move_category_usecase,
    get_remove_category_image_usecase,
    get_set_category_image_usecase,
    get_update_category_usecase,
)
from app.catalog.models import Category
from app.catalog.schemas import (
    CategoryCreateSchema,
    CategoryMoveSchema,
    CategorySchema,
    CategoryUpdateSchema,
)
from app.catalog.services.exceptions import CategoryInUseError, InvalidCategoryError
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
from app.core.uploads import UploadError
from app.units.dependencies import (
    get_bind_units_usecase,
    get_create_unit_usecase,
    get_delete_unit_usecase,
    get_load_units_usecase,
    get_unit,
    get_unit_repository,
    get_update_unit_usecase,
)
from app.units.models import Unit
from app.units.schemas import (
    CategoryUnitsSchema,
    CategoryUnitsUpdateSchema,
    UnitCreateSchema,
    UnitSchema,
    UnitUpdateSchema,
)
from app.units.services.exceptions import InvalidUnitError, UnitInUseError
from app.units.services.repo import UnitRepository
from app.units.services.usecases.category_units import BindUnitsUseCase, LoadCategoryUnitsUseCase
from app.units.services.usecases.manage_units import (
    CreateUnitUseCase,
    DeleteUnitUseCase,
    UpdateUnitUseCase,
)

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/categories")
async def list_categories(
    tree: CategoryTree = Depends(get_full_category_tree),
    categories: CategoryRepository = Depends(get_category_repository),
) -> list[AdminCategorySchema]:
    """Всё дерево категорий со скрытыми и числом объявлений."""

    counts = await categories.count_listings()

    return [AdminCategorySchema.from_tree(tree, root, counts) for root in tree.roots()]


@router.post("/categories", status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryCreateSchema,
    usecase: CreateCategoryUseCase = Depends(get_create_category_usecase),
) -> CategorySchema:
    """Добавить категорию в конец уровня."""

    try:
        category = await usecase.execute(payload)
    except InvalidCategoryError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error

    return CategorySchema.model_validate(category)


@router.put("/categories/{category_id}")
async def update_category(
    payload: CategoryUpdateSchema,
    category: Category = Depends(get_admin_category),
    usecase: UpdateCategoryUseCase = Depends(get_update_category_usecase),
) -> CategorySchema:
    """Изменить название, адрес, видимость и родителя."""

    try:
        updated = await usecase.execute(category, payload)
    except InvalidCategoryError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error

    return CategorySchema.model_validate(updated)


@router.post("/categories/{category_id}/move")
async def move_category(
    payload: CategoryMoveSchema,
    category: Category = Depends(get_admin_category),
    usecase: MoveCategoryUseCase = Depends(get_move_category_usecase),
) -> CategorySchema:
    """Сдвинуть категорию выше или ниже среди соседних."""

    return CategorySchema.model_validate(await usecase.execute(category, payload.direction))


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category: Category = Depends(get_admin_category),
    usecase: DeleteCategoryUseCase = Depends(get_delete_category_usecase),
) -> None:
    """Удалить пустую категорию: без подкатегорий и объявлений."""

    try:
        await usecase.execute(category)
    except CategoryInUseError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.put("/categories/{category_id}/image")
async def set_category_image(
    file: UploadFile,
    category: Category = Depends(get_admin_category),
    usecase: SetCategoryImageUseCase = Depends(get_set_category_image_usecase),
) -> CategorySchema:
    """Загрузить картинку плитки. Прежняя удаляется."""

    try:
        updated = await usecase.execute(category, file)
    except UploadError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error

    return CategorySchema.model_validate(updated)


@router.delete("/categories/{category_id}/image")
async def remove_category_image(
    category: Category = Depends(get_admin_category),
    usecase: RemoveCategoryImageUseCase = Depends(get_remove_category_image_usecase),
) -> CategorySchema:
    """Убрать картинку плитки."""

    return CategorySchema.model_validate(await usecase.execute(category))


@router.get("/categories/{category_id}/attributes")
async def get_category_attributes(
    category: Category = Depends(get_admin_category),
    tree: CategoryTree = Depends(get_full_category_tree),
    usecase: LoadBindingsUseCase = Depends(get_load_bindings_usecase),
) -> CategoryAttributesSchema:
    """Свои атрибуты категории и полученные от родителей."""

    own, inherited = await usecase.execute(tree, category)

    return CategoryAttributesSchema(
        own=[
            CategoryFieldSchema.from_field(CategoryField(binding.attribute, binding.is_required))
            for binding in own
        ],
        inherited=[
            InheritedFieldSchema(
                **CategoryFieldSchema.from_field(
                    CategoryField(binding.attribute, binding.is_required)
                ).model_dump(),
                category_name=tree.by_id[binding.category_id].name,
            )
            for binding in inherited
        ],
    )


@router.put("/categories/{category_id}/attributes", status_code=status.HTTP_204_NO_CONTENT)
async def set_category_attributes(
    payload: CategoryAttributesUpdateSchema,
    category: Category = Depends(get_admin_category),
    usecase: BindAttributesUseCase = Depends(get_bind_attributes_usecase),
) -> None:
    """Задать свои атрибуты категории по порядку. Подкатегории получат их автоматически."""

    try:
        await usecase.execute(category, payload.items)
    except InvalidAttributeError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error


@router.get("/attributes")
async def list_attributes(
    attributes: AttributeRepository = Depends(get_attribute_repository),
) -> list[AttributeSchema]:
    """Справочник атрибутов с вариантами."""

    return [AttributeSchema.model_validate(attribute) for attribute in await attributes.list_all()]


@router.post("/attributes", status_code=status.HTTP_201_CREATED)
async def create_attribute(
    payload: AttributeCreateSchema,
    usecase: CreateAttributeUseCase = Depends(get_create_attribute_usecase),
) -> AttributeSchema:
    """Добавить атрибут в справочник."""

    try:
        attribute = await usecase.execute(payload)
    except InvalidAttributeError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error

    return AttributeSchema.model_validate(attribute)


@router.put("/attributes/{attribute_id}")
async def update_attribute(
    payload: AttributeUpdateSchema,
    attribute: Attribute = Depends(get_attribute),
    usecase: UpdateAttributeUseCase = Depends(get_update_attribute_usecase),
) -> AttributeSchema:
    """Изменить название, единицу, фильтр и варианты. Адрес и тип не меняются."""

    try:
        updated = await usecase.execute(attribute, payload)
    except InvalidAttributeError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error

    return AttributeSchema.model_validate(updated)


@router.delete("/attributes/{attribute_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attribute(
    attribute: Attribute = Depends(get_attribute),
    usecase: DeleteAttributeUseCase = Depends(get_delete_attribute_usecase),
) -> None:
    """Удалить атрибут из справочника и из всех категорий."""

    await usecase.execute(attribute)


@router.get("/units")
async def list_units(
    units: UnitRepository = Depends(get_unit_repository),
) -> list[UnitSchema]:
    """Справочник единиц цены: сначала для товаров, потом для услуг."""

    return [UnitSchema.model_validate(unit) for unit in await units.list_all()]


@router.post("/units", status_code=status.HTTP_201_CREATED)
async def create_unit(
    payload: UnitCreateSchema,
    usecase: CreateUnitUseCase = Depends(get_create_unit_usecase),
) -> UnitSchema:
    """Добавить единицу цены."""

    try:
        unit = await usecase.execute(payload)
    except InvalidUnitError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error

    return UnitSchema.model_validate(unit)


@router.put("/units/{unit_id}")
async def update_unit(
    payload: UnitUpdateSchema,
    unit: Unit = Depends(get_unit),
    usecase: UpdateUnitUseCase = Depends(get_update_unit_usecase),
) -> UnitSchema:
    """Переименовать единицу. Код и тип не меняются."""

    return UnitSchema.model_validate(await usecase.execute(unit, payload))


@router.delete("/units/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_unit(
    unit: Unit = Depends(get_unit),
    usecase: DeleteUnitUseCase = Depends(get_delete_unit_usecase),
) -> None:
    """Удалить единицу, которой нет ни в одном объявлении."""

    try:
        await usecase.execute(unit)
    except UnitInUseError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.get("/categories/{category_id}/units")
async def get_category_units(
    category: Category = Depends(get_admin_category),
    tree: CategoryTree = Depends(get_full_category_tree),
    usecase: LoadCategoryUnitsUseCase = Depends(get_load_units_usecase),
) -> CategoryUnitsSchema:
    """Свои единицы категории и те, что она берёт у ближайшего родителя."""

    source, units = await usecase.nearest(tree, category)
    schemas = [UnitSchema.model_validate(unit) for unit in units]

    if source is category:
        return CategoryUnitsSchema(own=schemas, inherited=[], inherited_from=None)

    return CategoryUnitsSchema(
        own=[],
        inherited=schemas,
        inherited_from=source.name if source else None,
    )


@router.put("/categories/{category_id}/units", status_code=status.HTTP_204_NO_CONTENT)
async def set_category_units(
    payload: CategoryUnitsUpdateSchema,
    category: Category = Depends(get_admin_category),
    usecase: BindUnitsUseCase = Depends(get_bind_units_usecase),
) -> None:
    """Задать свои единицы категории. Пустой список — брать у родителя."""

    try:
        await usecase.execute(category, payload.unit_ids)
    except InvalidUnitError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error
