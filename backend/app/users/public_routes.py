from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.follows.dependencies import get_follow_repository
from app.follows.services.repo import FollowRepository
from app.users.dependencies import get_user_repository
from app.users.models import User
from app.users.schemas import PublicUserSchema
from app.users.services.repo import UserRepository

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{user_id}")
async def get_public_user(
    user_id: int,
    viewer: User | None = Depends(get_current_user),
    users: UserRepository = Depends(get_user_repository),
    follows: FollowRepository = Depends(get_follow_repository),
) -> PublicUserSchema:
    """Открытый профиль автора: имя, город, рейтинг и подписан ли на него тот, кто смотрит."""

    user = await users.get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")

    following = set()
    if viewer is not None:
        following = await follows.following_ids(viewer.id, [user.id])

    return PublicUserSchema.model_validate(user).model_copy(
        update={"following": user.id in following}
    )
