from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.articles.dependencies import (
    get_article_like_repository,
    get_article_repository,
    get_create_article_comment_usecase,
    get_published_article,
)
from app.articles.models import Article, ArticleSection
from app.articles.schemas import ArticleCardSchema, ArticlePageSchema, ArticleSchema
from app.articles.services.repo import ArticleLikeRepository, ArticleRepository
from app.articles.services.usecases.comment_article import CreateArticleCommentUseCase
from app.auth.dependencies import get_current_user, require_user
from app.posts.dependencies import get_load_threads_usecase
from app.posts.models import PostComment
from app.posts.schemas import (
    CommentSaveSchema,
    CommentSchema,
    CommentThreadPageSchema,
    LikesSchema,
)
from app.posts.services.exceptions import CommentNotFoundError
from app.posts.services.usecases.load_threads import LoadThreadsUseCase
from app.users.models import User

router = APIRouter(prefix="/articles", tags=["articles"])


@router.get("")
async def list_articles(
    section: ArticleSection = Query(..., description="Блог или новости"),
    limit: int = Query(12, ge=1, le=50),
    offset: int = Query(0, ge=0),
    articles: ArticleRepository = Depends(get_article_repository),
) -> ArticlePageSchema:
    """Опубликованные статьи раздела, новые первыми. Открыто всем."""

    items, total = await articles.list_published(section, limit, offset)

    return ArticlePageSchema(
        items=[ArticleCardSchema.model_validate(item) for item in items], total=total
    )


@router.post("/{article_id:int}/like")
async def like_article(
    article: Article = Depends(get_published_article),
    user: User = Depends(require_user),
    articles: ArticleRepository = Depends(get_article_repository),
    likes: ArticleLikeRepository = Depends(get_article_like_repository),
) -> LikesSchema:
    """Поставить лайк статье."""

    await likes.add(user.id, article.id)

    return LikesSchema(likes_count=await articles.refresh_likes(article.id), liked=True)


@router.delete("/{article_id:int}/like")
async def unlike_article(
    article: Article = Depends(get_published_article),
    user: User = Depends(require_user),
    articles: ArticleRepository = Depends(get_article_repository),
    likes: ArticleLikeRepository = Depends(get_article_like_repository),
) -> LikesSchema:
    """Убрать лайк со статьи."""

    await likes.remove(user.id, article.id)

    return LikesSchema(likes_count=await articles.refresh_likes(article.id), liked=False)


@router.get("/{article_id:int}/comments")
async def list_article_comments(
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
    article: Article = Depends(get_published_article),
    user: User | None = Depends(get_current_user),
    usecase: LoadThreadsUseCase = Depends(get_load_threads_usecase),
) -> CommentThreadPageSchema:
    """Обсуждение статьи: ветки по порядку написания с ответами. Открыто всем."""

    return await usecase.execute(
        PostComment.article_id == article.id, article.comments_count, user, limit, offset
    )


@router.post("/{article_id:int}/comments", status_code=status.HTTP_201_CREATED)
async def create_article_comment(
    payload: CommentSaveSchema,
    article: Article = Depends(get_published_article),
    user: User = Depends(require_user),
    usecase: CreateArticleCommentUseCase = Depends(get_create_article_comment_usecase),
) -> CommentSchema:
    """Комментарий к статье или ответ в обсуждении. Только после входа."""

    try:
        comment = await usecase.execute(user, article, payload)
    except CommentNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Комментарий не найден"
        ) from error

    return CommentSchema.model_validate(comment)


@router.get("/{section}/{slug}")
async def get_article(
    section: ArticleSection,
    slug: str,
    user: User | None = Depends(get_current_user),
    articles: ArticleRepository = Depends(get_article_repository),
    likes: ArticleLikeRepository = Depends(get_article_like_repository),
) -> ArticleSchema:
    """Опубликованная статья по адресу с лайком того, кто смотрит. Черновика или чужого раздела нет — 404."""

    article = await articles.get_published(section, slug)
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Статья не найдена")

    liked = user is not None and await likes.liked(user.id, article.id)

    return ArticleSchema.for_viewer(article, liked)
