"""Сценарий удаления пользователя из админки."""

from app.admin.services.exceptions import UserNotDeletableError
from app.admin.services.repo import AdminUserRepository, UserTraces
from app.articles.services.repo import ArticleRepository
from app.core.uploads import remove_file
from app.posts.services.comment_repo import PostCommentRepository
from app.posts.services.repo import PostRepository
from app.reviews.services.repo import ReviewRepository
from app.users.models import User


class DeleteUserUseCase:
    """Удалить пользователя со всем, что он создал, и его файлами. Счётчики у остальных пересчитываются."""

    def __init__(
        self,
        users: AdminUserRepository,
        posts: PostRepository,
        comments: PostCommentRepository,
        articles: ArticleRepository,
        reviews: ReviewRepository,
    ) -> None:
        self.users = users
        self.posts = posts
        self.comments = comments
        self.articles = articles
        self.reviews = reviews

    async def execute(self, admin: User, user: User) -> None:
        """Удалить. Себя и других администраторов — UserNotDeletableError."""

        if user.id == admin.id or user.is_admin:
            raise UserNotDeletableError("Нельзя удалить себя или другого администратора")

        traces = await self.users.traces(user)
        await self.users.delete(user.id)

        for path in traces.files:
            remove_file(path)

        await self.refresh_counters(traces)

    async def refresh_counters(self, traces: UserTraces) -> None:
        """Пересчитать лайки, репосты, комментарии и рейтинги, которые менял удалённый пользователь."""

        for post_id in traces.liked_posts:
            await self.posts.refresh_likes(post_id)
        for post_id in traces.reposted_posts:
            await self.posts.refresh_reposts(post_id)
        for post_id in traces.commented_posts:
            await self.comments.refresh_count(post_id, None)
        for article_id in traces.commented_articles:
            await self.comments.refresh_count(None, article_id)
        for comment_id in traces.liked_comments:
            await self.comments.refresh_likes(comment_id)
        for article_id in traces.liked_articles:
            await self.articles.refresh_likes(article_id)
        for seller_id in traces.reviewed_sellers:
            await self.reviews.refresh_seller_rating(seller_id)
