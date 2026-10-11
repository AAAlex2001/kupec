"""Публикации: репозитории, фабрики сценариев и загрузка поста по id из пути."""

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user, require_user
from app.core.ai import AiClient
from app.core.config import get_settings
from app.core.database import get_session
from app.follows.dependencies import get_follow_repository
from app.follows.services.repo import FollowRepository
from app.notifications.dependencies import get_notify_usecase
from app.notifications.services.usecases.notify import NotifyUseCase
from app.posts.models import Post, PostComment, PostReport, PostStatus
from app.posts.services.ai_repo import AiRequestRepository
from app.posts.services.comment_repo import CommentLikeRepository, PostCommentRepository
from app.posts.services.report_repo import PostReportRepository
from app.posts.services.repo import (
    PostLikeRepository,
    PostMediaRepository,
    PostRepository,
    PostSaveRepository,
    PostViewRepository,
)
from app.posts.services.usecases.count_view import CountPostViewUseCase
from app.posts.services.usecases.create_comment import CreateCommentUseCase
from app.posts.services.usecases.create_post import CreatePostUseCase
from app.posts.services.usecases.create_repost import CreateRepostUseCase
from app.posts.services.usecases.delete_post import DeletePostUseCase
from app.posts.services.usecases.like_post import LikePostUseCase
from app.posts.services.usecases.load_marks import LoadMarksUseCase
from app.posts.services.usecases.load_threads import LoadThreadsUseCase
from app.posts.services.usecases.manage_media import (
    DeletePostMediaUseCase,
    UploadPostMediaUseCase,
)
from app.posts.services.usecases.moderate_post import DismissReportUseCase, SetPostStatusUseCase
from app.posts.services.usecases.update_post import UpdatePostUseCase
from app.posts.services.usecases.write_with_ai import WritePostWithAiUseCase
from app.users.models import User


def get_post_repository(
    session: AsyncSession = Depends(get_session),
) -> PostRepository:
    """Репозиторий постов с сессией текущего запроса."""

    return PostRepository(session)


def get_post_media_repository(
    session: AsyncSession = Depends(get_session),
) -> PostMediaRepository:
    """Репозиторий файлов к постам с сессией текущего запроса."""

    return PostMediaRepository(session)


def get_post_like_repository(
    session: AsyncSession = Depends(get_session),
) -> PostLikeRepository:
    """Репозиторий лайков с сессией текущего запроса."""

    return PostLikeRepository(session)


def get_post_save_repository(
    session: AsyncSession = Depends(get_session),
) -> PostSaveRepository:
    """Репозиторий сохранённых постов с сессией текущего запроса."""

    return PostSaveRepository(session)


def get_post_view_repository(
    session: AsyncSession = Depends(get_session),
) -> PostViewRepository:
    """Репозиторий просмотров постов с сессией текущего запроса."""

    return PostViewRepository(session)


def get_count_post_view_usecase(
    posts: PostRepository = Depends(get_post_repository),
    views: PostViewRepository = Depends(get_post_view_repository),
) -> CountPostViewUseCase:
    """Сценарий подсчёта просмотра поста."""

    return CountPostViewUseCase(posts, views)


def get_comment_repository(
    session: AsyncSession = Depends(get_session),
) -> PostCommentRepository:
    """Репозиторий комментариев с сессией текущего запроса."""

    return PostCommentRepository(session)


def get_comment_like_repository(
    session: AsyncSession = Depends(get_session),
) -> CommentLikeRepository:
    """Репозиторий лайков комментариев с сессией текущего запроса."""

    return CommentLikeRepository(session)


def get_load_marks_usecase(
    likes: PostLikeRepository = Depends(get_post_like_repository),
    saves: PostSaveRepository = Depends(get_post_save_repository),
    follows: FollowRepository = Depends(get_follow_repository),
) -> LoadMarksUseCase:
    """Сценарий отметок того, кто смотрит посты."""

    return LoadMarksUseCase(likes, saves, follows)


def get_load_threads_usecase(
    comments: PostCommentRepository = Depends(get_comment_repository),
    likes: CommentLikeRepository = Depends(get_comment_like_repository),
) -> LoadThreadsUseCase:
    """Сценарий веток комментариев постранично."""

    return LoadThreadsUseCase(comments, likes)


def get_ai_request_repository(
    session: AsyncSession = Depends(get_session),
) -> AiRequestRepository:
    """Репозиторий запросов к ИИ с сессией текущего запроса."""

    return AiRequestRepository(session)


def get_write_with_ai_usecase(
    requests: AiRequestRepository = Depends(get_ai_request_repository),
) -> WritePostWithAiUseCase:
    """Сценарий ИИ-помощника постов."""

    settings = get_settings()

    return WritePostWithAiUseCase(AiClient(settings), requests, settings)


def get_report_repository(
    session: AsyncSession = Depends(get_session),
) -> PostReportRepository:
    """Репозиторий жалоб с сессией текущего запроса."""

    return PostReportRepository(session)


def get_set_post_status_usecase(
    posts: PostRepository = Depends(get_post_repository),
    reports: PostReportRepository = Depends(get_report_repository),
) -> SetPostStatusUseCase:
    """Сценарий скрытия поста и возврата в ленту."""

    return SetPostStatusUseCase(posts, reports)


def get_dismiss_report_usecase(
    reports: PostReportRepository = Depends(get_report_repository),
) -> DismissReportUseCase:
    """Сценарий отклонения жалобы."""

    return DismissReportUseCase(reports)


def get_like_post_usecase(
    posts: PostRepository = Depends(get_post_repository),
    likes: PostLikeRepository = Depends(get_post_like_repository),
    notify: NotifyUseCase = Depends(get_notify_usecase),
) -> LikePostUseCase:
    """Сценарий лайка поста."""

    return LikePostUseCase(posts, likes, notify)


def get_create_repost_usecase(
    posts: PostRepository = Depends(get_post_repository),
    notify: NotifyUseCase = Depends(get_notify_usecase),
) -> CreateRepostUseCase:
    """Сценарий репоста."""

    return CreateRepostUseCase(posts, notify)


def get_create_comment_usecase(
    comments: PostCommentRepository = Depends(get_comment_repository),
    notify: NotifyUseCase = Depends(get_notify_usecase),
) -> CreateCommentUseCase:
    """Сценарий нового комментария."""

    return CreateCommentUseCase(comments, notify)


def get_create_post_usecase(
    posts: PostRepository = Depends(get_post_repository),
    media: PostMediaRepository = Depends(get_post_media_repository),
) -> CreatePostUseCase:
    """Сценарий нового поста."""

    return CreatePostUseCase(posts, media)


def get_update_post_usecase(
    posts: PostRepository = Depends(get_post_repository),
    media: PostMediaRepository = Depends(get_post_media_repository),
) -> UpdatePostUseCase:
    """Сценарий правки поста."""

    return UpdatePostUseCase(posts, media)


def get_delete_post_usecase(
    posts: PostRepository = Depends(get_post_repository),
) -> DeletePostUseCase:
    """Сценарий удаления поста."""

    return DeletePostUseCase(posts)


def get_upload_post_media_usecase(
    media: PostMediaRepository = Depends(get_post_media_repository),
) -> UploadPostMediaUseCase:
    """Сценарий загрузки фото или видео к посту."""

    return UploadPostMediaUseCase(media)


def get_delete_post_media_usecase(
    media: PostMediaRepository = Depends(get_post_media_repository),
) -> DeletePostMediaUseCase:
    """Сценарий удаления файла к посту."""

    return DeletePostMediaUseCase(media)


def post_not_found() -> HTTPException:
    """Ответ 404 «Публикация не найдена»."""

    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Публикация не найдена")


async def get_post(
    post_id: int,
    posts: PostRepository = Depends(get_post_repository),
) -> Post:
    """Пост по id из пути. Нет — 404."""

    post = await posts.get_by_id(post_id)
    if post is None:
        raise post_not_found()

    return post


async def get_own_post(
    post: Post = Depends(get_post),
    user: User = Depends(require_user),
) -> Post:
    """Свой пост по id из пути. Чужой выглядит как несуществующий — 404."""

    if post.author_id != user.id:
        raise post_not_found()

    return post


async def get_published_post(post: Post = Depends(get_post)) -> Post:
    """Опубликованный пост по id из пути. Черновик и скрытый — 404."""

    if post.status != PostStatus.PUBLISHED:
        raise post_not_found()

    return post


async def get_comment(
    comment_id: int,
    comments: PostCommentRepository = Depends(get_comment_repository),
) -> PostComment:
    """Комментарий по id из пути. Нет — 404."""

    comment = await comments.get_by_id(comment_id)
    if comment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Комментарий не найден")

    return comment


async def get_own_comment(
    comment: PostComment = Depends(get_comment),
    user: User = Depends(require_user),
) -> PostComment:
    """Свой комментарий по id из пути. Чужой выглядит как несуществующий — 404."""

    if comment.author_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Комментарий не найден")

    return comment


async def get_visible_post(
    post: Post = Depends(get_post),
    user: User | None = Depends(get_current_user),
) -> Post:
    """Пост, который можно показать: опубликованный или свой. Иначе — 404."""

    if post.status == PostStatus.PUBLISHED or (user and post.author_id == user.id):
        return post

    raise post_not_found()


async def get_report(
    report_id: int,
    reports: PostReportRepository = Depends(get_report_repository),
) -> PostReport:
    """Жалоба по id из пути. Нет — 404."""

    report = await reports.get_by_id(report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Жалоба не найдена")

    return report
