"""Сценарий правки своего поста."""

from app.core.uploads import remove_file
from app.posts.models import Post
from app.posts.schemas import PostSaveSchema
from app.posts.services.usecases.save_post import SavePostUseCase


class UpdatePostUseCase(SavePostUseCase):
    """Изменить текст, файлы и объявления поста, опубликовать черновик или вернуть в черновики."""

    async def execute(self, post: Post, payload: PostSaveSchema) -> Post:
        """Вернуть изменённый пост. Убранные из поста файлы удаляются с диска."""

        old_paths = {item.path for item in post.media}
        await self.fill(post, post.author_id, payload)
        updated = await self.posts.save(post)

        for path in old_paths - {item.path for item in updated.media}:
            remove_file(path)

        return updated
