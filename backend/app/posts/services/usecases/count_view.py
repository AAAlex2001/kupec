"""Сценарий подсчёта просмотра поста."""

from datetime import datetime, timezone

from app.posts.models import Post
from app.posts.services.repo import PostRepository, PostViewRepository


class CountPostViewUseCase:
    """Засчитать просмотр: один посетитель — один раз в сутки, автор не считается."""

    def __init__(self, posts: PostRepository, views: PostViewRepository) -> None:
        self.posts = posts
        self.views = views

    async def execute(self, post: Post, visitor: str, user_id: int | None) -> None:
        """Прибавить просмотр, если посетитель сегодня этот пост ещё не видел."""

        if user_id == post.author_id:
            return

        today = datetime.now(timezone.utc).date()
        if await self.views.add_once(post.id, visitor, today):
            await self.posts.add_view(post.id)
