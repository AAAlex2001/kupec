"""Общее для создания и правки поста: проверка файлов и объявлений, перенос полей."""

from datetime import datetime, timezone

from app.listings.models import Listing
from app.posts.models import Post, PostMedia, PostStatus
from app.posts.schemas import PostSaveSchema
from app.posts.services.exceptions import (
    EmptyPostError,
    PostListingNotFoundError,
    PostMediaNotFoundError,
)
from app.posts.services.repo import PostMediaRepository, PostRepository
from app.posts.services.validators import clean_html, has_text


class SavePostUseCase:
    """Проверить файлы и объявления поста и записать поля формы в пост."""

    def __init__(self, posts: PostRepository, media: PostMediaRepository) -> None:
        self.posts = posts
        self.media = media

    async def check_media(
        self, owner_id: int, media_ids: list[int], post_id: int | None
    ) -> list[PostMedia]:
        """Файлы по порядку из формы. Чужой или занятый другим постом — PostMediaNotFoundError."""

        media_ids = list(dict.fromkeys(media_ids))
        files = await self.media.list_usable(owner_id, media_ids, post_id)
        if len(files) != len(media_ids):
            raise PostMediaNotFoundError("Файл не найден, загрузите его заново")

        by_id = {item.id: item for item in files}

        return [by_id[media_id] for media_id in media_ids]

    async def check_listings(self, owner_id: int, listing_ids: list[int]) -> list[Listing]:
        """Свои опубликованные объявления из формы. Иначе — PostListingNotFoundError."""

        listing_ids = list(dict.fromkeys(listing_ids))
        listings = await self.posts.list_own_listings(owner_id, listing_ids)
        if len(listings) != len(listing_ids):
            raise PostListingNotFoundError("Объявление не найдено или снято с публикации")

        return listings

    async def fill(self, post: Post, owner_id: int, payload: PostSaveSchema) -> None:
        """Перенести поля в пост. Пустой — EmptyPostError."""

        html = clean_html(payload.html)
        media = await self.check_media(owner_id, payload.media_ids, post.id)
        listings = await self.check_listings(owner_id, payload.listing_ids)
        if not has_text(html) and not media and not listings:
            raise EmptyPostError("Напишите текст, добавьте фото или объявление")

        for position, item in enumerate(media):
            item.sort_order = position

        post.html = html
        post.media = media
        post.listings = listings
        post.status = PostStatus.DRAFT if payload.draft else PostStatus.PUBLISHED

        if post.status == PostStatus.PUBLISHED and post.published_at is None:
            post.published_at = datetime.now(timezone.utc)
