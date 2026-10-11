"""Статьи: репозиторий, фабрики сценариев и загрузка статьи по id из пути."""

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.articles.models import Article
from app.articles.services.repo import (
    ArticleLikeRepository,
    ArticleRepository,
    ArticleViewRepository,
)
from app.articles.services.usecases.comment_article import CreateArticleCommentUseCase
from app.articles.services.usecases.count_view import CountArticleViewUseCase
from app.articles.services.usecases.manage_article import (
    DeleteArticleUseCase,
    RemoveArticleCoverUseCase,
    SetArticleCoverUseCase,
)
from app.articles.services.usecases.save_article import CreateArticleUseCase, UpdateArticleUseCase
from app.core.config import get_settings
from app.core.database import get_session
from app.core.indexnow import IndexNowClient
from app.notifications.dependencies import get_notify_usecase
from app.notifications.services.usecases.notify import NotifyUseCase
from app.posts.dependencies import get_comment_repository
from app.posts.services.comment_repo import PostCommentRepository


def get_article_repository(session: AsyncSession = Depends(get_session)) -> ArticleRepository:
    """Репозиторий статей с сессией текущего запроса."""

    return ArticleRepository(session)


def get_article_like_repository(
    session: AsyncSession = Depends(get_session),
) -> ArticleLikeRepository:
    """Репозиторий лайков статей с сессией текущего запроса."""

    return ArticleLikeRepository(session)


def get_article_view_repository(
    session: AsyncSession = Depends(get_session),
) -> ArticleViewRepository:
    """Репозиторий просмотров статей с сессией текущего запроса."""

    return ArticleViewRepository(session)


def get_count_article_view_usecase(
    articles: ArticleRepository = Depends(get_article_repository),
    views: ArticleViewRepository = Depends(get_article_view_repository),
) -> CountArticleViewUseCase:
    """Сценарий подсчёта просмотра статьи."""

    return CountArticleViewUseCase(articles, views)


async def get_published_article(
    article_id: int,
    articles: ArticleRepository = Depends(get_article_repository),
) -> Article:
    """Опубликованная статья по id из пути — для лайков, просмотров и обсуждения. Черновика нет — 404."""

    article = await articles.get_published_by_id(article_id)
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Статья не найдена")

    return article


def get_create_article_comment_usecase(
    comments: PostCommentRepository = Depends(get_comment_repository),
    notify: NotifyUseCase = Depends(get_notify_usecase),
) -> CreateArticleCommentUseCase:
    """Сценарий комментария к статье."""

    return CreateArticleCommentUseCase(comments, notify)


def get_indexnow() -> IndexNowClient:
    """Клиент IndexNow с настройками из .env."""

    return IndexNowClient(get_settings())


async def get_article(
    article_id: int,
    articles: ArticleRepository = Depends(get_article_repository),
) -> Article:
    """Статья по id из пути, в том числе черновик. Нет — 404."""

    article = await articles.get_by_id(article_id)
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Статья не найдена")

    return article


def get_create_article_usecase(
    articles: ArticleRepository = Depends(get_article_repository),
) -> CreateArticleUseCase:
    """Сценарий новой статьи."""

    return CreateArticleUseCase(articles)


def get_update_article_usecase(
    articles: ArticleRepository = Depends(get_article_repository),
) -> UpdateArticleUseCase:
    """Сценарий правки статьи."""

    return UpdateArticleUseCase(articles)


def get_delete_article_usecase(
    articles: ArticleRepository = Depends(get_article_repository),
) -> DeleteArticleUseCase:
    """Сценарий удаления статьи."""

    return DeleteArticleUseCase(articles)


def get_set_article_cover_usecase(
    articles: ArticleRepository = Depends(get_article_repository),
) -> SetArticleCoverUseCase:
    """Сценарий загрузки обложки."""

    return SetArticleCoverUseCase(articles)


def get_remove_article_cover_usecase(
    articles: ArticleRepository = Depends(get_article_repository),
) -> RemoveArticleCoverUseCase:
    """Сценарий удаления обложки."""

    return RemoveArticleCoverUseCase(articles)
