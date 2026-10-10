from fastapi import APIRouter, Depends, Query, status

from app.admin.schemas import AdminPostPageSchema, AdminReportPageSchema, ReportCountsSchema
from app.auth.dependencies import require_admin
from app.posts.dependencies import (
    get_comment,
    get_comment_repository,
    get_delete_post_usecase,
    get_dismiss_report_usecase,
    get_post,
    get_post_repository,
    get_report,
    get_report_repository,
    get_set_post_status_usecase,
)
from app.posts.models import Post, PostComment, PostReport, PostStatus, ReportStatus
from app.posts.schemas import PostCountsSchema, PostSchema, ReportSchema
from app.posts.services.comment_repo import PostCommentRepository
from app.posts.services.report_repo import PostReportRepository
from app.posts.services.repo import PostRepository
from app.posts.services.usecases.delete_post import DeletePostUseCase
from app.posts.services.usecases.moderate_post import DismissReportUseCase, SetPostStatusUseCase

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/posts")
async def list_posts(
    status_filter: PostStatus = Query(PostStatus.PUBLISHED, alias="status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    posts: PostRepository = Depends(get_post_repository),
) -> AdminPostPageSchema:
    """Посты всех авторов на вкладке модерации и счётчики вкладок."""

    items, total = await posts.list_by_status(status_filter, limit, offset)
    counts = await posts.count_by_status()

    return AdminPostPageSchema(
        items=[PostSchema.model_validate(item) for item in items],
        total=total,
        counts=PostCountsSchema(**counts),
    )


@router.post("/posts/{post_id}/hide")
async def hide_post(
    post: Post = Depends(get_post),
    usecase: SetPostStatusUseCase = Depends(get_set_post_status_usecase),
) -> PostSchema:
    """Скрыть пост: он пропадает из ленты и со страницы автора. Жалобы на него закрываются."""

    return PostSchema.model_validate(await usecase.execute(post, PostStatus.HIDDEN))


@router.post("/posts/{post_id}/show")
async def show_post(
    post: Post = Depends(get_post),
    usecase: SetPostStatusUseCase = Depends(get_set_post_status_usecase),
) -> PostSchema:
    """Вернуть скрытый пост в ленту."""

    return PostSchema.model_validate(await usecase.execute(post, PostStatus.PUBLISHED))


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post: Post = Depends(get_post),
    usecase: DeletePostUseCase = Depends(get_delete_post_usecase),
) -> None:
    """Удалить любой пост вместе с файлами, комментариями и жалобами."""

    await usecase.execute(post)


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment: PostComment = Depends(get_comment),
    comments: PostCommentRepository = Depends(get_comment_repository),
) -> None:
    """Удалить любой комментарий вместе с ответами и жалобами."""

    await comments.delete(comment)


@router.get("/reports")
async def list_reports(
    status_filter: ReportStatus = Query(ReportStatus.OPEN, alias="status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    reports: PostReportRepository = Depends(get_report_repository),
) -> AdminReportPageSchema:
    """Жалобы на посты и комментарии, новые первыми, и счётчики вкладок."""

    items, total = await reports.list_by_status(status_filter, limit, offset)
    counts = await reports.count_by_status()

    return AdminReportPageSchema(
        items=[ReportSchema.model_validate(item) for item in items],
        total=total,
        counts=ReportCountsSchema(**counts),
    )


@router.post("/reports/{report_id}/dismiss", status_code=status.HTTP_204_NO_CONTENT)
async def dismiss_report(
    report: PostReport = Depends(get_report),
    usecase: DismissReportUseCase = Depends(get_dismiss_report_usecase),
) -> None:
    """Отклонить жалобу: нарушений нет."""

    await usecase.execute(report)
