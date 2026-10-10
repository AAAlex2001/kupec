from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, UploadFile, status

from app.articles.dependencies import (
    get_article,
    get_article_repository,
    get_create_article_usecase,
    get_delete_article_usecase,
    get_indexnow,
    get_remove_article_cover_usecase,
    get_set_article_cover_usecase,
    get_update_article_usecase,
)
from app.articles.models import Article, ArticleSection, ArticleStatus
from app.articles.schemas import AdminArticlePageSchema, AdminArticleSchema, ArticleSaveSchema
from app.articles.services.exceptions import ArticleSlugTakenError
from app.articles.services.repo import ArticleRepository
from app.articles.services.usecases.manage_article import (
    DeleteArticleUseCase,
    RemoveArticleCoverUseCase,
    SetArticleCoverUseCase,
)
from app.articles.services.usecases.save_article import CreateArticleUseCase, UpdateArticleUseCase
from app.auth.dependencies import require_admin
from app.core.indexnow import IndexNowClient
from app.core.uploads import UploadError

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


def slug_taken_error(error: ArticleSlugTakenError) -> HTTPException:
    """HTTP-ошибка, если адрес занят другой статьёй."""

    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=f"Адрес «{error}» уже занят другой статьёй",
    )


def announce(article: Article, background: BackgroundTasks, indexnow: IndexNowClient) -> None:
    """Опубликованную статью отправить в IndexNow фоном, чтобы не задерживать ответ."""

    if article.status == ArticleStatus.PUBLISHED:
        background.add_task(indexnow.notify, [article.path])


@router.get("/articles")
async def list_articles(
    section: ArticleSection = Query(ArticleSection.NEWS),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    articles: ArticleRepository = Depends(get_article_repository),
) -> AdminArticlePageSchema:
    """Статьи раздела с черновиками, недавно изменённые первыми."""

    items, total = await articles.list_for_admin(section, limit, offset)

    return AdminArticlePageSchema(
        items=[AdminArticleSchema.model_validate(item) for item in items], total=total
    )


@router.post("/articles", status_code=status.HTTP_201_CREATED)
async def create_article(
    payload: ArticleSaveSchema,
    background: BackgroundTasks,
    usecase: CreateArticleUseCase = Depends(get_create_article_usecase),
    indexnow: IndexNowClient = Depends(get_indexnow),
) -> AdminArticleSchema:
    """Новая статья. Опубликованная сразу уходит в IndexNow."""

    try:
        article = await usecase.execute(payload)
    except ArticleSlugTakenError as error:
        raise slug_taken_error(error) from error

    announce(article, background, indexnow)

    return AdminArticleSchema.model_validate(article)


@router.get("/articles/{article_id}")
async def get_admin_article(article: Article = Depends(get_article)) -> AdminArticleSchema:
    """Статья для редактора, в том числе черновик."""

    return AdminArticleSchema.model_validate(article)


@router.put("/articles/{article_id}")
async def update_article(
    payload: ArticleSaveSchema,
    background: BackgroundTasks,
    article: Article = Depends(get_article),
    usecase: UpdateArticleUseCase = Depends(get_update_article_usecase),
    indexnow: IndexNowClient = Depends(get_indexnow),
) -> AdminArticleSchema:
    """Изменить статью. Опубликованная уходит в IndexNow, чтобы поисковик обновил её."""

    try:
        saved = await usecase.execute(article, payload)
    except ArticleSlugTakenError as error:
        raise slug_taken_error(error) from error

    announce(saved, background, indexnow)

    return AdminArticleSchema.model_validate(saved)


@router.delete("/articles/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article: Article = Depends(get_article),
    usecase: DeleteArticleUseCase = Depends(get_delete_article_usecase),
) -> None:
    """Удалить статью вместе с обложкой."""

    await usecase.execute(article)


@router.put("/articles/{article_id}/cover")
async def set_article_cover(
    file: UploadFile,
    article: Article = Depends(get_article),
    usecase: SetArticleCoverUseCase = Depends(get_set_article_cover_usecase),
) -> AdminArticleSchema:
    """Загрузить обложку. Прежняя удаляется."""

    try:
        saved = await usecase.execute(article, file)
    except UploadError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error

    return AdminArticleSchema.model_validate(saved)


@router.delete("/articles/{article_id}/cover")
async def remove_article_cover(
    article: Article = Depends(get_article),
    usecase: RemoveArticleCoverUseCase = Depends(get_remove_article_cover_usecase),
) -> AdminArticleSchema:
    """Убрать обложку."""

    return AdminArticleSchema.model_validate(await usecase.execute(article))
