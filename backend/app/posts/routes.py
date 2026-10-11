import logging
import math
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, status

from app.auth.dependencies import get_current_user, get_visitor, require_user
from app.core.ai import AiError
from app.core.uploads import UploadError
from app.posts.dependencies import (
    get_comment,
    get_comment_like_repository,
    get_comment_repository,
    get_count_post_view_usecase,
    get_create_comment_usecase,
    get_create_post_usecase,
    get_create_repost_usecase,
    get_delete_post_media_usecase,
    get_delete_post_usecase,
    get_like_post_usecase,
    get_load_marks_usecase,
    get_load_threads_usecase,
    get_own_comment,
    get_own_post,
    get_post_like_repository,
    get_post_repository,
    get_post_save_repository,
    get_published_post,
    get_report_repository,
    get_update_post_usecase,
    get_upload_post_media_usecase,
    get_visible_post,
    get_write_with_ai_usecase,
)
from app.posts.models import MediaKind, Post, PostComment, PostReport, PostStatus
from app.posts.schemas import (
    AssistantAnswerSchema,
    AssistantRequestSchema,
    CommentEditSchema,
    CommentSaveSchema,
    CommentSchema,
    CommentThreadPageSchema,
    LikesSchema,
    PostCountsSchema,
    PostMediaSchema,
    PostPageSchema,
    PostSaveSchema,
    PostSchema,
    ReportSaveSchema,
    RepostSaveSchema,
    UnseenSchema,
)
from app.posts.services.comment_repo import CommentLikeRepository, PostCommentRepository
from app.posts.services.exceptions import (
    CommentNotFoundError,
    EmptyAiAnswerError,
    EmptyPostError,
    PostListingNotFoundError,
    PostMediaNotFoundError,
    TooManyAiRequestsError,
    TooManyPostMediaError,
)
from app.posts.services.report_repo import PostReportRepository
from app.posts.services.repo import PostLikeRepository, PostRepository, PostSaveRepository
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
from app.posts.services.usecases.update_post import UpdatePostUseCase
from app.posts.services.usecases.write_with_ai import WritePostWithAiUseCase
from app.users.dependencies import get_user_repository
from app.users.models import User
from app.users.services.repo import UserRepository

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/posts", tags=["posts"])


@router.post("/media", status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile,
    kind: MediaKind = Query(MediaKind.PHOTO, description="Фото или видео"),
    user: User = Depends(require_user),
    usecase: UploadPostMediaUseCase = Depends(get_upload_post_media_usecase),
) -> PostMediaSchema:
    """Загрузить фото или видео для будущего поста. id передаётся при сохранении."""

    try:
        item = await usecase.execute(user, file, kind)
    except UploadError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error
    except TooManyPostMediaError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Слишком много загруженных файлов. Опубликуйте пост или удалите лишние",
        ) from error

    return PostMediaSchema.model_validate(item)


@router.delete("/media/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(
    media_id: int,
    user: User = Depends(require_user),
    usecase: DeletePostMediaUseCase = Depends(get_delete_post_media_usecase),
) -> None:
    """Удалить загруженный файл, пока он не привязан к посту."""

    try:
        await usecase.execute(user, media_id)
    except PostMediaNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Файл не найден",
        ) from error


@router.post("/assistant")
async def write_with_ai(
    payload: AssistantRequestSchema,
    user: User = Depends(require_user),
    usecase: WritePostWithAiUseCase = Depends(get_write_with_ai_usecase),
) -> AssistantAnswerSchema:
    """ИИ-помощник: пишет пост по просьбе автора или переделывает текущий текст."""

    try:
        html = await usecase.execute(user, payload.instruction, payload.html)
    except TooManyAiRequestsError as error:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Лимит запросов к ИИ исчерпан. Попробуйте через {math.ceil(error.retry_after / 60)} мин",
            headers={"Retry-After": str(error.retry_after)},
        ) from error
    except (AiError, EmptyAiAnswerError) as error:
        logger.warning("ИИ-помощник не ответил: %s", error)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ИИ-помощник сейчас не отвечает. Попробуйте ещё раз чуть позже",
        ) from error

    return AssistantAnswerSchema(html=html)


@router.get("/feed")
async def list_feed(
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    user: User | None = Depends(get_current_user),
    posts: PostRepository = Depends(get_post_repository),
    marks: LoadMarksUseCase = Depends(get_load_marks_usecase),
) -> PostPageSchema:
    """Лента «Для вас»: опубликованные посты и репосты всех авторов. Открыта всем."""

    items, total = await posts.list_published(limit, offset)

    return PostPageSchema.for_viewer(items, total, await marks.execute(user, items))


@router.get("/feed/following/unseen")
async def count_unseen_following(
    user: User = Depends(require_user),
    posts: PostRepository = Depends(get_post_repository),
) -> UnseenSchema:
    """Сколько постов опубликовали авторы из подписок с прошлого захода во вкладку «Подписки»."""

    return UnseenSchema(count=await posts.count_following_since(user.id, user.following_seen_at))


@router.post("/feed/following/seen", status_code=status.HTTP_204_NO_CONTENT)
async def mark_following_seen(
    user: User = Depends(require_user),
    users: UserRepository = Depends(get_user_repository),
) -> None:
    """Отметить, что вкладка «Подписки» просмотрена: счётчик новых постов обнуляется."""

    user.following_seen_at = datetime.now(timezone.utc)
    await users.save(user)


@router.get("/feed/following")
async def list_following_feed(
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    user: User = Depends(require_user),
    posts: PostRepository = Depends(get_post_repository),
    marks: LoadMarksUseCase = Depends(get_load_marks_usecase),
) -> PostPageSchema:
    """Лента «Подписки»: посты и репосты авторов, на которых вы подписаны."""

    items, total = await posts.list_following(user.id, limit, offset)

    return PostPageSchema.for_viewer(items, total, await marks.execute(user, items))


@router.get("/author/{author_id}")
async def list_author_posts(
    author_id: int,
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    user: User | None = Depends(get_current_user),
    posts: PostRepository = Depends(get_post_repository),
    marks: LoadMarksUseCase = Depends(get_load_marks_usecase),
) -> PostPageSchema:
    """Опубликованные посты автора для его страницы. Открыты всем."""

    items, total = await posts.list_by_author(author_id, limit, offset)

    return PostPageSchema.for_viewer(items, total, await marks.execute(user, items))


@router.get("/reposts")
async def list_my_reposts(
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    user: User = Depends(require_user),
    posts: PostRepository = Depends(get_post_repository),
    marks: LoadMarksUseCase = Depends(get_load_marks_usecase),
) -> PostPageSchema:
    """Свои репосты, новые первыми."""

    items, total = await posts.list_reposts(user.id, limit, offset)

    return PostPageSchema.for_viewer(items, total, await marks.execute(user, items))


@router.get("/saved")
async def list_saved_posts(
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    user: User = Depends(require_user),
    posts: PostRepository = Depends(get_post_repository),
    marks: LoadMarksUseCase = Depends(get_load_marks_usecase),
) -> PostPageSchema:
    """Сохранённые посты, недавно сохранённые первыми."""

    items, total = await posts.list_saved(user.id, limit, offset)

    return PostPageSchema.for_viewer(items, total, await marks.execute(user, items))


@router.get("/my/counts")
async def count_my_posts(
    user: User = Depends(require_user),
    posts: PostRepository = Depends(get_post_repository),
) -> PostCountsSchema:
    """Сколько своих постов опубликовано, в черновиках и скрыто."""

    return PostCountsSchema(**await posts.count_for_author(user.id))


@router.get("/my")
async def list_my_posts(
    status_filter: PostStatus = Query(PostStatus.PUBLISHED, alias="status"),
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    user: User = Depends(require_user),
    posts: PostRepository = Depends(get_post_repository),
    marks: LoadMarksUseCase = Depends(get_load_marks_usecase),
) -> PostPageSchema:
    """Свои посты на вкладке «Публикации», «Черновики» или «Скрытые»."""

    items, total = await posts.list_for_author(user.id, status_filter, limit, offset)

    return PostPageSchema.for_viewer(items, total, await marks.execute(user, items))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_post(
    payload: PostSaveSchema,
    user: User = Depends(require_user),
    usecase: CreatePostUseCase = Depends(get_create_post_usecase),
) -> PostSchema:
    """Опубликовать пост или сохранить черновиком."""

    try:
        post = await usecase.execute(user, payload)
    except (EmptyPostError, PostMediaNotFoundError, PostListingNotFoundError) as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error

    return PostSchema.model_validate(post)


@router.put("/comments/{comment_id}")
async def update_comment(
    payload: CommentEditSchema,
    comment: PostComment = Depends(get_own_comment),
    user: User = Depends(require_user),
    comments: PostCommentRepository = Depends(get_comment_repository),
    likes: CommentLikeRepository = Depends(get_comment_like_repository),
) -> CommentSchema:
    """Изменить текст своего комментария."""

    comment.text = payload.text.strip()
    updated = await comments.save(comment)
    liked = await likes.liked_ids(user.id, [updated.id])

    return CommentSchema.for_viewer(updated, liked)


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment: PostComment = Depends(get_own_comment),
    comments: PostCommentRepository = Depends(get_comment_repository),
) -> None:
    """Удалить свой комментарий вместе с ответами на него."""

    await comments.delete(comment)


@router.post("/comments/{comment_id}/like")
async def like_comment(
    comment: PostComment = Depends(get_comment),
    user: User = Depends(require_user),
    comments: PostCommentRepository = Depends(get_comment_repository),
    likes: CommentLikeRepository = Depends(get_comment_like_repository),
) -> LikesSchema:
    """Поставить лайк комментарию."""

    await likes.add(user.id, comment.id)

    return LikesSchema(likes_count=await comments.refresh_likes(comment.id), liked=True)


@router.delete("/comments/{comment_id}/like")
async def unlike_comment(
    comment: PostComment = Depends(get_comment),
    user: User = Depends(require_user),
    comments: PostCommentRepository = Depends(get_comment_repository),
    likes: CommentLikeRepository = Depends(get_comment_like_repository),
) -> LikesSchema:
    """Убрать лайк с комментария."""

    await likes.remove(user.id, comment.id)

    return LikesSchema(likes_count=await comments.refresh_likes(comment.id), liked=False)


@router.post("/comments/{comment_id}/report", status_code=status.HTTP_204_NO_CONTENT)
async def report_comment(
    payload: ReportSaveSchema,
    comment: PostComment = Depends(get_comment),
    user: User = Depends(require_user),
    reports: PostReportRepository = Depends(get_report_repository),
) -> None:
    """Пожаловаться на комментарий. Жалоба уходит модератору."""

    await reports.add(
        PostReport(reporter_id=user.id, comment_id=comment.id, reason=payload.reason.strip())
    )


@router.get("/{post_id}")
async def get_post(
    post: Post = Depends(get_visible_post),
    user: User | None = Depends(get_current_user),
    marks: LoadMarksUseCase = Depends(get_load_marks_usecase),
) -> PostSchema:
    """Пост по id: опубликованный — всем, свой черновик — автору."""

    return PostSchema.for_viewer(post, await marks.execute(user, [post]))


@router.put("/{post_id}")
async def update_post(
    payload: PostSaveSchema,
    post: Post = Depends(get_own_post),
    usecase: UpdatePostUseCase = Depends(get_update_post_usecase),
) -> PostSchema:
    """Изменить свой пост."""

    try:
        updated = await usecase.execute(post, payload)
    except (EmptyPostError, PostMediaNotFoundError, PostListingNotFoundError) as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error

    return PostSchema.model_validate(updated)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post: Post = Depends(get_own_post),
    usecase: DeletePostUseCase = Depends(get_delete_post_usecase),
) -> None:
    """Удалить свой пост."""

    await usecase.execute(post)


@router.get("/{post_id}/comments")
async def list_comments(
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
    post: Post = Depends(get_visible_post),
    user: User | None = Depends(get_current_user),
    usecase: LoadThreadsUseCase = Depends(get_load_threads_usecase),
) -> CommentThreadPageSchema:
    """Ветки комментариев по порядку написания: корневой комментарий и все ответы в нём. Открыты всем."""

    return await usecase.execute(
        PostComment.post_id == post.id, post.comments_count, user, limit, offset
    )


@router.post("/{post_id}/comments", status_code=status.HTTP_201_CREATED)
async def create_comment(
    payload: CommentSaveSchema,
    post: Post = Depends(get_published_post),
    user: User = Depends(require_user),
    usecase: CreateCommentUseCase = Depends(get_create_comment_usecase),
) -> CommentSchema:
    """Написать комментарий или ответить на комментарий."""

    try:
        comment = await usecase.execute(user, post, payload)
    except CommentNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    return CommentSchema.model_validate(comment)


@router.post("/{post_id}/report", status_code=status.HTTP_204_NO_CONTENT)
async def report_post(
    payload: ReportSaveSchema,
    post: Post = Depends(get_published_post),
    user: User = Depends(require_user),
    reports: PostReportRepository = Depends(get_report_repository),
) -> None:
    """Пожаловаться на пост. Жалоба уходит модератору."""

    await reports.add(PostReport(reporter_id=user.id, post_id=post.id, reason=payload.reason.strip()))


@router.post("/{post_id}/repost", status_code=status.HTTP_201_CREATED)
async def repost(
    payload: RepostSaveSchema,
    post: Post = Depends(get_published_post),
    user: User = Depends(require_user),
    usecase: CreateRepostUseCase = Depends(get_create_repost_usecase),
) -> PostSchema:
    """Репостнуть публикацию: просто или с комментарием."""

    return PostSchema.model_validate(await usecase.execute(user, post, payload))


@router.post("/{post_id}/view", status_code=status.HTTP_204_NO_CONTENT)
async def count_post_view(
    post: Post = Depends(get_published_post),
    visitor: str = Depends(get_visitor),
    user: User | None = Depends(get_current_user),
    usecase: CountPostViewUseCase = Depends(get_count_post_view_usecase),
) -> None:
    """Засчитать просмотр. Один посетитель — один просмотр в сутки, автор не считается."""

    await usecase.execute(post, visitor, user.id if user else None)


@router.post("/{post_id}/like")
async def like_post(
    post: Post = Depends(get_published_post),
    user: User = Depends(require_user),
    usecase: LikePostUseCase = Depends(get_like_post_usecase),
) -> LikesSchema:
    """Поставить лайк. Автору приходит уведомление."""

    return LikesSchema(likes_count=await usecase.execute(user, post), liked=True)


@router.delete("/{post_id}/like")
async def unlike_post(
    post: Post = Depends(get_published_post),
    user: User = Depends(require_user),
    posts: PostRepository = Depends(get_post_repository),
    likes: PostLikeRepository = Depends(get_post_like_repository),
) -> LikesSchema:
    """Убрать лайк."""

    await likes.remove(user.id, post.id)

    return LikesSchema(likes_count=await posts.refresh_likes(post.id), liked=False)


@router.post("/{post_id}/save", status_code=status.HTTP_204_NO_CONTENT)
async def save_post(
    post: Post = Depends(get_published_post),
    user: User = Depends(require_user),
    saves: PostSaveRepository = Depends(get_post_save_repository),
) -> None:
    """Сохранить пост себе."""

    await saves.add(user.id, post.id)


@router.delete("/{post_id}/save", status_code=status.HTTP_204_NO_CONTENT)
async def unsave_post(
    post: Post = Depends(get_published_post),
    user: User = Depends(require_user),
    saves: PostSaveRepository = Depends(get_post_save_repository),
) -> None:
    """Убрать пост из сохранённого."""

    await saves.remove(user.id, post.id)
