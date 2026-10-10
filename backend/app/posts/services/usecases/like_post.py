"""Сценарий лайка поста."""

from app.notifications.models import Notification, NotificationKind
from app.notifications.services.usecases.notify import NotifyUseCase
from app.posts.models import Post
from app.posts.services.repo import PostLikeRepository, PostRepository
from app.users.models import User


class LikePostUseCase:
    """Поставить лайк и сообщить автору. Повторный лайк уведомления не дублирует."""

    def __init__(
        self, posts: PostRepository, likes: PostLikeRepository, notify: NotifyUseCase
    ) -> None:
        self.posts = posts
        self.likes = likes
        self.notify = notify

    async def execute(self, user: User, post: Post) -> int:
        """Вернуть, сколько у поста лайков после нажатия."""

        await self.likes.add(user.id, post.id)
        await self.notify.execute(
            Notification(
                user_id=post.author_id,
                actor_id=user.id,
                kind=NotificationKind.LIKE,
                post_id=post.id,
            )
        )

        return await self.posts.refresh_likes(post.id)
