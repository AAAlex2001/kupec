from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.admin.dependencies import (
    get_admin_listing_repository,
    get_admin_user_repository,
    get_delete_user_usecase,
)
from app.admin.schemas import (
    AdminListingPageSchema,
    AdminReviewPageSchema,
    AdminReviewTextSchema,
    AdminUserPageSchema,
    AdminUserSchema,
)
from app.admin.services.exceptions import UserNotDeletableError
from app.admin.services.repo import AdminListingRepository, AdminUserRepository
from app.admin.services.usecases.delete_user import DeleteUserUseCase
from app.auth.dependencies import require_admin
from app.listings.models import ListingStatus
from app.listings.schemas import ListingCountsSchema, ListingSchema
from app.reviews.dependencies import (
    get_approve_review_usecase,
    get_delete_review_usecase,
    get_edit_review_text_usecase,
    get_reject_review_usecase,
    get_review,
    get_review_repository,
)
from app.reviews.models import Review, ReviewStatus
from app.reviews.schemas import ReviewCountsSchema, ReviewRejectSchema, ReviewSchema
from app.reviews.services.repo import ReviewRepository
from app.reviews.services.usecases.delete_review import DeleteReviewUseCase
from app.reviews.services.usecases.moderate_review import (
    ApproveReviewUseCase,
    EditReviewTextUseCase,
    RejectReviewUseCase,
)
from app.users.models import User

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/users")
async def list_users(
    q: str | None = Query(None, max_length=100, description="Поиск по почте и имени"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    users: AdminUserRepository = Depends(get_admin_user_repository),
) -> AdminUserPageSchema:
    """Пользователи с числом объявлений, новые первыми."""

    rows, total = await users.list(q.strip() if q else None, limit, offset)
    items = [
        AdminUserSchema.model_validate(user).model_copy(update={"listings_count": count})
        for user, count in rows
    ]

    return AdminUserPageSchema(items=items, total=total)


@router.get("/users/{user_id}")
async def get_user(
    user_id: int,
    users: AdminUserRepository = Depends(get_admin_user_repository),
) -> AdminUserSchema:
    """Пользователь по id."""

    user = await users.get(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )

    return AdminUserSchema.model_validate(user)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    users: AdminUserRepository = Depends(get_admin_user_repository),
    usecase: DeleteUserUseCase = Depends(get_delete_user_usecase),
) -> None:
    """Удалить пользователя со всеми объявлениями, публикациями, отзывами, перепиской и файлами."""

    user = await users.get(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")

    try:
        await usecase.execute(admin, user)
    except UserNotDeletableError as error:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(error)) from error


@router.get("/listings")
async def list_listings(
    status_filter: ListingStatus = Query(ListingStatus.PUBLISHED, alias="status"),
    q: str | None = Query(None, max_length=100, description="Поиск по названию"),
    owner: int | None = Query(None, description="Только объявления этого пользователя"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    listings: AdminListingRepository = Depends(get_admin_listing_repository),
) -> AdminListingPageSchema:
    """Объявления всех пользователей на вкладке и счётчики вкладок."""

    search = q.strip() if q else None
    items, total = await listings.list(status_filter, search, owner, limit, offset)
    counts = await listings.count_by_status(search, owner)

    return AdminListingPageSchema(
        items=[ListingSchema.model_validate(item) for item in items],
        total=total,
        counts=ListingCountsSchema(**counts),
    )


@router.get("/reviews")
async def list_reviews(
    status_filter: ReviewStatus = Query(ReviewStatus.PENDING, alias="status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    reviews: ReviewRepository = Depends(get_review_repository),
) -> AdminReviewPageSchema:
    """Отзывы на вкладке модерации, старые первыми, и счётчики вкладок."""

    items, total = await reviews.list_by_status(status_filter, limit, offset)
    counts = await reviews.count_by_status()

    return AdminReviewPageSchema(
        items=[ReviewSchema.model_validate(item) for item in items],
        total=total,
        counts=ReviewCountsSchema(**counts),
    )


@router.post("/reviews/{review_id}/approve")
async def approve_review(
    review: Review = Depends(get_review),
    usecase: ApproveReviewUseCase = Depends(get_approve_review_usecase),
) -> ReviewSchema:
    """Опубликовать отзыв."""

    return ReviewSchema.model_validate(await usecase.execute(review))


@router.post("/reviews/{review_id}/reject")
async def reject_review(
    payload: ReviewRejectSchema,
    review: Review = Depends(get_review),
    usecase: RejectReviewUseCase = Depends(get_reject_review_usecase),
) -> ReviewSchema:
    """Отклонить отзыв с причиной."""

    return ReviewSchema.model_validate(await usecase.execute(review, payload.reason))


@router.put("/reviews/{review_id}/text")
async def edit_review_text(
    payload: AdminReviewTextSchema,
    review: Review = Depends(get_review),
    usecase: EditReviewTextUseCase = Depends(get_edit_review_text_usecase),
) -> ReviewSchema:
    """Поправить текст отзыва, не меняя его состояние."""

    return ReviewSchema.model_validate(await usecase.execute(review, payload.text))


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review: Review = Depends(get_review),
    usecase: DeleteReviewUseCase = Depends(get_delete_review_usecase),
) -> None:
    """Удалить любой отзыв."""

    await usecase.execute(review)
