"""Сценарий нового поста."""

from app.posts.models import Post
from app.posts.schemas import PostSaveSchema
from app.posts.services.usecases.save_post import SavePostUseCase
from app.users.models import User


class CreatePostUseCase(SavePostUseCase):
    """Опубликовать пост сразу или сохранить черновиком."""

    async def execute(self, user: User, payload: PostSaveSchema) -> Post:
        """Вернуть новый пост. Пустой — EmptyPostError."""

        post = Post(author_id=user.id)
        await self.fill(post, user.id, payload)

        return await self.posts.add(post)
