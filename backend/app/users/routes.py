from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from app.auth.dependencies import require_user
from app.core.uploads import UploadError
from app.users.dependencies import (
    get_remove_avatar_usecase,
    get_set_avatar_usecase,
    get_update_profile_usecase,
)
from app.users.models import User
from app.users.schemas import UserSchema, UserUpdateSchema
from app.users.services.exceptions import (
    CityNotFoundError,
    InvalidNameError,
    InvalidPhoneError,
)
from app.users.services.usecases.manage_avatar import RemoveAvatarUseCase, SetAvatarUseCase
from app.users.services.usecases.update_profile import UpdateProfileUseCase

router = APIRouter(prefix="/me", tags=["profile"])


@router.get("")
async def me(user: User = Depends(require_user)) -> UserSchema:
    """Текущий пользователь по cookie. Сайт вызывает при открытии страницы."""

    return UserSchema.model_validate(user)


@router.patch("")
async def update_me(
    payload: UserUpdateSchema,
    user: User = Depends(require_user),
    usecase: UpdateProfileUseCase = Depends(get_update_profile_usecase),
) -> UserSchema:
    """Изменение профиля: имя, телефон, город, уведомления."""

    try:
        updated = await usecase.execute(user, payload)
    except (InvalidNameError, InvalidPhoneError) as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error
    except CityNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Такого города нет",
        ) from error

    return UserSchema.model_validate(updated)


@router.put("/avatar")
async def set_avatar(
    file: UploadFile,
    user: User = Depends(require_user),
    usecase: SetAvatarUseCase = Depends(get_set_avatar_usecase),
) -> UserSchema:
    """Замена аватара. Прежний файл удаляется."""

    try:
        updated = await usecase.execute(user, file)
    except UploadError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error

    return UserSchema.model_validate(updated)


@router.delete("/avatar")
async def remove_avatar(
    user: User = Depends(require_user),
    usecase: RemoveAvatarUseCase = Depends(get_remove_avatar_usecase),
) -> UserSchema:
    """Удаление аватара."""

    updated = await usecase.execute(user)

    return UserSchema.model_validate(updated)
