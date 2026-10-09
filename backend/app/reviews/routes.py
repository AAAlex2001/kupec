from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, status

from app.auth.dependencies import require_user
from app.core.uploads import UploadError
from app.reviews.dependencies import (
    get_create_review_usecase,
    get_delete_review_photo_usecase,
    get_delete_review_usecase,
    get_own_review,
    get_reply_review_usecase,
    get_review,
    get_review_repository,
    get_update_review_usecase,
    get_upload_review_photo_usecase,
)
from app.reviews.models import Review, ReviewStatus
from app.reviews.schemas import (
    ReviewableListingSchema,
    ReviewCountsSchema,
    ReviewCreateSchema,
    ReviewListSchema,
    ReviewPhotoSchema,
    ReviewReplySchema,
    ReviewSaveSchema,
    ReviewSchema,
    SellerReviewsSchema,
)
from app.reviews.services.exceptions import (
    ReviewNotAllowedError,
    ReviewNotFoundError,
    ReviewPhotoNotFoundError,
    TooManyReviewPhotosError,
)
from app.reviews.services.repo import ReviewRepository
from app.reviews.services.usecases.create_review import CreateReviewUseCase
from app.reviews.services.usecases.delete_review import DeleteReviewUseCase
from app.reviews.services.usecases.manage_photos import (
    DeleteReviewPhotoUseCase,
    UploadReviewPhotoUseCase,
)
from app.reviews.services.usecases.reply_review import ReplyReviewUseCase
from app.reviews.services.usecases.update_review import UpdateReviewUseCase
from app.users.models import User

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("/photos", status_code=status.HTTP_201_CREATED)
async def upload_photo(
    file: UploadFile,
    user: User = Depends(require_user),
    usecase: UploadReviewPhotoUseCase = Depends(get_upload_review_photo_usecase),
) -> ReviewPhotoSchema:
    """Загрузить фото для будущего отзыва. id передаётся в форме при отправке."""

    try:
        photo = await usecase.execute(user, file)
    except UploadError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error
    except TooManyReviewPhotosError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Слишком много загруженных фото. Отправьте отзыв или удалите лишние",
        ) from error

    return ReviewPhotoSchema.model_validate(photo)


@router.delete("/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(
    photo_id: int,
    user: User = Depends(require_user),
    usecase: DeleteReviewPhotoUseCase = Depends(get_delete_review_photo_usecase),
) -> None:
    """Удалить загруженное фото, пока отзыв не отправлен."""

    try:
        await usecase.execute(user, photo_id)
    except ReviewPhotoNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Фото не найдено",
        ) from error


@router.get("/my")
async def list_my_reviews(
    status_filter: ReviewStatus = Query(ReviewStatus.PUBLISHED, alias="status"),
    user: User = Depends(require_user),
    reviews: ReviewRepository = Depends(get_review_repository),
) -> ReviewListSchema:
    """Свои отзывы на вкладке «Опубликованные», «На проверке» или «Отклонённые» и счётчики."""

    items = await reviews.list_for_author(user.id, status_filter)
    counts = await reviews.count_for_author(user.id)

    return ReviewListSchema(
        items=[ReviewSchema.model_validate(item) for item in items],
        counts=ReviewCountsSchema(**counts),
    )


@router.get("/reviewable")
async def list_reviewable(
    user: User = Depends(require_user),
    reviews: ReviewRepository = Depends(get_review_repository),
) -> list[ReviewableListingSchema]:
    """Объявления, по которым вы переписывались и ещё не оставили отзыв."""

    items = await reviews.list_reviewable_listings(user.id)

    return [ReviewableListingSchema.model_validate(item) for item in items]


@router.get("/seller/{seller_id}")
async def list_seller_reviews(
    seller_id: int,
    limit: int = Query(5, ge=1, le=50),
    offset: int = Query(0, ge=0),
    reviews: ReviewRepository = Depends(get_review_repository),
) -> SellerReviewsSchema:
    """Опубликованные отзывы о продавце, новые первыми, и сколько их всего."""

    items, total = await reviews.list_published_for_seller(seller_id, limit, offset)

    return SellerReviewsSchema(
        items=[ReviewSchema.model_validate(item) for item in items],
        total=total,
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_review(
    payload: ReviewCreateSchema,
    user: User = Depends(require_user),
    usecase: CreateReviewUseCase = Depends(get_create_review_usecase),
) -> ReviewSchema:
    """Оставить отзыв. Он уходит на проверку или сразу отклоняется автопроверкой."""

    try:
        review = await usecase.execute(user, payload)
    except ReviewNotAllowedError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(error),
        ) from error
    except ReviewPhotoNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error

    return ReviewSchema.model_validate(review)


@router.put("/{review_id}")
async def update_review(
    payload: ReviewSaveSchema,
    review: Review = Depends(get_own_review),
    usecase: UpdateReviewUseCase = Depends(get_update_review_usecase),
) -> ReviewSchema:
    """Изменить свой отзыв. Он снова уходит на проверку."""

    try:
        updated = await usecase.execute(review, payload)
    except ReviewPhotoNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error

    return ReviewSchema.model_validate(updated)


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review: Review = Depends(get_own_review),
    usecase: DeleteReviewUseCase = Depends(get_delete_review_usecase),
) -> None:
    """Удалить свой отзыв."""

    await usecase.execute(review)


@router.post("/{review_id}/reply")
async def reply_review(
    payload: ReviewReplySchema,
    user: User = Depends(require_user),
    review: Review = Depends(get_review),
    usecase: ReplyReviewUseCase = Depends(get_reply_review_usecase),
) -> ReviewSchema:
    """Ответить на опубликованный отзыв о себе."""

    try:
        updated = await usecase.execute(user, review, payload.text)
    except ReviewNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Отзыв не найден",
        ) from error

    return ReviewSchema.model_validate(updated)
