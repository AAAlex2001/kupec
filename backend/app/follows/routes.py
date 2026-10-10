from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import require_user
from app.follows.dependencies import get_follow_author_usecase, get_follow_repository
from app.follows.services.exceptions import FollowNotAllowedError
from app.follows.services.repo import FollowRepository
from app.follows.services.usecases.follow_author import FollowAuthorUseCase
from app.users.models import User

router = APIRouter(prefix="/follows", tags=["follows"])


@router.put("/{author_id}", status_code=status.HTTP_204_NO_CONTENT)
async def follow_author(
    author_id: int,
    user: User = Depends(require_user),
    usecase: FollowAuthorUseCase = Depends(get_follow_author_usecase),
) -> None:
    """Подписаться на автора."""

    try:
        await usecase.execute(user, author_id)
    except FollowNotAllowedError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error


@router.delete("/{author_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unfollow_author(
    author_id: int,
    user: User = Depends(require_user),
    follows: FollowRepository = Depends(get_follow_repository),
) -> None:
    """Отписаться от автора."""

    await follows.remove(user.id, author_id)
