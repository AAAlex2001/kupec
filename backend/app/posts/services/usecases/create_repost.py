"""Сценарий репоста."""

from datetime import datetime, timezone

from app.notifications.models import Notification, NotificationKind
from app.notifications.services.usecases.notify import NotifyUseCase
from app.posts.models import Post, PostStatus
from app.posts.schemas import RepostSaveSchema
from app.posts.services.repo import PostRepository
from app.core.html import clean_html
from app.users.models import User


class CreateRepostUseCase:
    """Репостнуть публикацию сразу: просто или с комментарием. Репост репоста ведёт на оригинал.

    Автору оригинала приходит уведомление.
    """

    def __init__(self, posts: PostRepository, notify: NotifyUseCase) -> None:
        self.posts = posts
        self.notify = notify

    async def execute(self, user: User, post: Post, payload: RepostSaveSchema) -> Post:
        """Вернуть опубликованный репост и пересчитать репосты оригинала."""

        original = post.repost_of or post
        repost = Post(
            author_id=user.id,
            repost_of_id=original.id,
            html=clean_html(payload.html),
            status=PostStatus.PUBLISHED,
            published_at=datetime.now(timezone.utc),
        )

        created = await self.posts.add(repost)
        await self.posts.refresh_reposts(original.id)
        await self.notify.execute(
            Notification(
                user_id=original.author_id,
                actor_id=user.id,
                kind=NotificationKind.REPOST,
                post_id=original.id,
            )
        )

        return created
