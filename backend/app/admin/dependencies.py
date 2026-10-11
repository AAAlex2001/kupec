"""Админка: репозитории со списками пользователей и объявлений, сценарий удаления пользователя."""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.admin.services.repo import AdminListingRepository, AdminUserRepository
from app.admin.services.usecases.delete_user import DeleteUserUseCase
from app.articles.dependencies import get_article_repository
from app.articles.services.repo import ArticleRepository
from app.core.database import get_session
from app.posts.dependencies import get_comment_repository, get_post_repository
from app.posts.services.comment_repo import PostCommentRepository
from app.posts.services.repo import PostRepository
from app.reviews.dependencies import get_review_repository
from app.reviews.services.repo import ReviewRepository


def get_admin_user_repository(
    session: AsyncSession = Depends(get_session),
) -> AdminUserRepository:
    """Пользователи для админки с сессией текущего запроса."""

    return AdminUserRepository(session)


def get_admin_listing_repository(
    session: AsyncSession = Depends(get_session),
) -> AdminListingRepository:
    """Объявления для админки с сессией текущего запроса."""

    return AdminListingRepository(session)


def get_delete_user_usecase(
    users: AdminUserRepository = Depends(get_admin_user_repository),
    posts: PostRepository = Depends(get_post_repository),
    comments: PostCommentRepository = Depends(get_comment_repository),
    articles: ArticleRepository = Depends(get_article_repository),
    reviews: ReviewRepository = Depends(get_review_repository),
) -> DeleteUserUseCase:
    """Сценарий удаления пользователя."""

    return DeleteUserUseCase(users, posts, comments, articles, reviews)
