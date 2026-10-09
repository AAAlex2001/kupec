"""Отзывы: репозитории, фабрики сценариев и загрузка отзыва по id из пути."""

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import require_user
from app.core.database import get_session
from app.listings.dependencies import get_listing_repository
from app.listings.services.repo import ListingRepository
from app.reviews.models import Review
from app.reviews.services.repo import ReviewPhotoRepository, ReviewRepository
from app.reviews.services.usecases.create_review import CreateReviewUseCase
from app.reviews.services.usecases.delete_review import DeleteReviewUseCase
from app.reviews.services.usecases.manage_photos import (
    DeleteReviewPhotoUseCase,
    UploadReviewPhotoUseCase,
)
from app.reviews.services.usecases.moderate_review import (
    ApproveReviewUseCase,
    EditReviewTextUseCase,
    RejectReviewUseCase,
)
from app.reviews.services.usecases.reply_review import ReplyReviewUseCase
from app.reviews.services.usecases.update_review import UpdateReviewUseCase
from app.users.models import User


def get_review_repository(
    session: AsyncSession = Depends(get_session),
) -> ReviewRepository:
    """Репозиторий отзывов с сессией текущего запроса."""

    return ReviewRepository(session)


def get_review_photo_repository(
    session: AsyncSession = Depends(get_session),
) -> ReviewPhotoRepository:
    """Репозиторий фото к отзывам с сессией текущего запроса."""

    return ReviewPhotoRepository(session)


def get_create_review_usecase(
    reviews: ReviewRepository = Depends(get_review_repository),
    photos: ReviewPhotoRepository = Depends(get_review_photo_repository),
    listings: ListingRepository = Depends(get_listing_repository),
) -> CreateReviewUseCase:
    """Сценарий нового отзыва."""

    return CreateReviewUseCase(reviews, photos, listings)


def get_update_review_usecase(
    reviews: ReviewRepository = Depends(get_review_repository),
    photos: ReviewPhotoRepository = Depends(get_review_photo_repository),
) -> UpdateReviewUseCase:
    """Сценарий правки отзыва."""

    return UpdateReviewUseCase(reviews, photos)


def get_delete_review_usecase(
    reviews: ReviewRepository = Depends(get_review_repository),
) -> DeleteReviewUseCase:
    """Сценарий удаления отзыва."""

    return DeleteReviewUseCase(reviews)


def get_reply_review_usecase(
    reviews: ReviewRepository = Depends(get_review_repository),
) -> ReplyReviewUseCase:
    """Сценарий ответа продавца."""

    return ReplyReviewUseCase(reviews)


def get_approve_review_usecase(
    reviews: ReviewRepository = Depends(get_review_repository),
) -> ApproveReviewUseCase:
    """Сценарий публикации отзыва модератором."""

    return ApproveReviewUseCase(reviews)


def get_reject_review_usecase(
    reviews: ReviewRepository = Depends(get_review_repository),
) -> RejectReviewUseCase:
    """Сценарий отклонения отзыва модератором."""

    return RejectReviewUseCase(reviews)


def get_edit_review_text_usecase(
    reviews: ReviewRepository = Depends(get_review_repository),
) -> EditReviewTextUseCase:
    """Сценарий правки текста отзыва модератором."""

    return EditReviewTextUseCase(reviews)


def get_upload_review_photo_usecase(
    photos: ReviewPhotoRepository = Depends(get_review_photo_repository),
) -> UploadReviewPhotoUseCase:
    """Сценарий загрузки фото к отзыву."""

    return UploadReviewPhotoUseCase(photos)


def get_delete_review_photo_usecase(
    photos: ReviewPhotoRepository = Depends(get_review_photo_repository),
) -> DeleteReviewPhotoUseCase:
    """Сценарий удаления фото к отзыву."""

    return DeleteReviewPhotoUseCase(photos)


async def get_review(
    review_id: int,
    reviews: ReviewRepository = Depends(get_review_repository),
) -> Review:
    """Отзыв по id из пути. Нет — 404."""

    review = await reviews.get_by_id(review_id)
    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Отзыв не найден",
        )

    return review


async def get_own_review(
    review: Review = Depends(get_review),
    user: User = Depends(require_user),
) -> Review:
    """Свой отзыв по id из пути. Чужой выглядит как несуществующий — 404."""

    if review.author_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Отзыв не найден",
        )

    return review
