"""Атрибуты: репозиторий, сценарии и атрибут по id из пути."""

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.attributes.models import Attribute
from app.attributes.services.repo import AttributeRepository
from app.attributes.services.usecases.bind_attributes import BindAttributesUseCase
from app.attributes.services.usecases.load_bindings import LoadBindingsUseCase
from app.attributes.services.usecases.load_fields import LoadCategoryFieldsUseCase
from app.attributes.services.usecases.save_attribute import (
    CreateAttributeUseCase,
    DeleteAttributeUseCase,
    UpdateAttributeUseCase,
)
from app.core.database import get_session


def get_attribute_repository(
    session: AsyncSession = Depends(get_session),
) -> AttributeRepository:
    """Репозиторий атрибутов с сессией текущего запроса."""

    return AttributeRepository(session)


def get_load_fields_usecase(
    attributes: AttributeRepository = Depends(get_attribute_repository),
) -> LoadCategoryFieldsUseCase:
    """Сценарий: атрибуты, действующие в категории."""

    return LoadCategoryFieldsUseCase(attributes)


def get_load_bindings_usecase(
    attributes: AttributeRepository = Depends(get_attribute_repository),
) -> LoadBindingsUseCase:
    """Сценарий: свои и унаследованные привязки категории."""

    return LoadBindingsUseCase(attributes)


def get_create_attribute_usecase(
    attributes: AttributeRepository = Depends(get_attribute_repository),
) -> CreateAttributeUseCase:
    """Сценарий нового атрибута."""

    return CreateAttributeUseCase(attributes)


def get_update_attribute_usecase(
    attributes: AttributeRepository = Depends(get_attribute_repository),
) -> UpdateAttributeUseCase:
    """Сценарий правки атрибута."""

    return UpdateAttributeUseCase(attributes)


def get_delete_attribute_usecase(
    attributes: AttributeRepository = Depends(get_attribute_repository),
) -> DeleteAttributeUseCase:
    """Сценарий удаления атрибута."""

    return DeleteAttributeUseCase(attributes)


def get_bind_attributes_usecase(
    attributes: AttributeRepository = Depends(get_attribute_repository),
) -> BindAttributesUseCase:
    """Сценарий привязки атрибутов к категории."""

    return BindAttributesUseCase(attributes)


async def get_attribute(
    attribute_id: int,
    attributes: AttributeRepository = Depends(get_attribute_repository),
) -> Attribute:
    """Атрибут по id из пути. Нет — 404."""

    attribute = await attributes.get_by_id(attribute_id)
    if attribute is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Атрибут не найден",
        )

    return attribute
