"""Сценарий отметок того, кто смотрит посты."""

from app.follows.services.repo import FollowRepository
from app.posts.models import Post
from app.posts.schemas import ViewerMarks
from app.posts.services.repo import PostLikeRepository, PostSaveRepository
from app.users.models import User


class LoadMarksUseCase:
    """Какие из постов пользователь лайкнул и сохранил, на каких авторов подписан. Гостю — без отметок."""

    def __init__(
        self,
        likes: PostLikeRepository,
        saves: PostSaveRepository,
        follows: FollowRepository,
    ) -> None:
        self.likes = likes
        self.saves = saves
        self.follows = follows

    async def execute(self, user: User | None, posts: list[Post]) -> ViewerMarks:
        """Отметки пользователя для списка постов."""

        if user is None:
            return ViewerMarks()

        post_ids = [post.id for post in posts]
        author_ids = [post.author_id for post in posts]

        return ViewerMarks(
            liked=await self.likes.liked_ids(user.id, post_ids),
            saved=await self.saves.saved_ids(user.id, post_ids),
            following=await self.follows.following_ids(user.id, author_ids),
        )
