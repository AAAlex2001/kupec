"""Тесты публикаций без БД: очистка текста, публикация, черновик и объявления."""

import asyncio
from datetime import datetime, timezone

import pytest

from app.catalog.models import ListingKind
from app.listings.models import Listing, ListingStatus
from app.posts.models import Post, PostComment, PostMedia, PostStatus
from app.posts.schemas import (
    CommentSaveSchema,
    PostSaveSchema,
    PostSchema,
    RepostSaveSchema,
    ViewerMarks,
)
from app.posts.services.exceptions import (
    CommentNotFoundError,
    EmptyPostError,
    PostListingNotFoundError,
    PostMediaNotFoundError,
)
from app.posts.services.usecases.create_comment import CreateCommentUseCase
from app.posts.services.usecases.create_post import CreatePostUseCase
from app.posts.services.usecases.create_repost import CreateRepostUseCase
from app.core.html import clean_html
from app.users.models import User
from tests.fakes import FakeNotify

AUTHOR = User(id=1, email="anna@mail.ru", name="Анна")
LISTING = Listing(
    id=5, owner_id=AUTHOR.id, kind=ListingKind.SERVICE, title="Массаж", status=ListingStatus.PUBLISHED
)


class FakeMediaRepository:
    """Свободные файлы автора."""

    def __init__(self, items: list[PostMedia]) -> None:
        self.items = items

    async def list_usable(
        self, owner_id: int, media_ids: list[int], post_id: int | None
    ) -> list[PostMedia]:
        return [item for item in self.items if item.id in media_ids and item.owner_id == owner_id]


class FakePostRepository:
    """Свои опубликованные объявления автора и сохранение поста."""

    async def list_own_listings(self, owner_id: int, listing_ids: list[int]) -> list[Listing]:
        return [LISTING] if LISTING.id in listing_ids and owner_id == LISTING.owner_id else []

    async def add(self, post: Post) -> Post:
        post.id = 1

        return post


def save(payload: PostSaveSchema, media: list[PostMedia] | None = None) -> Post:
    usecase = CreatePostUseCase(FakePostRepository(), FakeMediaRepository(media or []))

    return asyncio.run(usecase.execute(AUTHOR, payload))


def test_clean_html_keeps_editor_tags_and_drops_scripts() -> None:
    html = (
        '<p onclick="steal()">Привет <strong>мир</strong><script>alert(1)</script></p>'
        '<a href="javascript:alert(1)">плохая</a><a href="https://ya.ru">хорошая</a>'
    )

    cleaned = clean_html(html)

    assert "<strong>мир</strong>" in cleaned
    assert "script" not in cleaned
    assert "onclick" not in cleaned
    assert "javascript" not in cleaned
    assert 'href="https://ya.ru"' in cleaned


def test_post_is_published_at_once_with_media_in_order() -> None:
    photo = PostMedia(id=7, owner_id=AUTHOR.id, kind="photo", path="posts/a.jpg")
    video = PostMedia(id=8, owner_id=AUTHOR.id, kind="video", path="posts/b.mp4")

    post = save(PostSaveSchema(html="<p>Заготовки</p>", media_ids=[8, 7]), [photo, video])

    assert post.status == PostStatus.PUBLISHED
    assert post.published_at is not None
    assert [item.id for item in post.media] == [8, 7]


def test_draft_is_not_published() -> None:
    post = save(PostSaveSchema(html="<p>Позже</p>", draft=True))

    assert post.status == PostStatus.DRAFT
    assert post.published_at is None


def test_post_can_hold_only_own_listing() -> None:
    post = save(PostSaveSchema(listing_ids=[LISTING.id]))
    assert post.listings == [LISTING]

    with pytest.raises(PostListingNotFoundError):
        save(PostSaveSchema(listing_ids=[99]))


def test_empty_post_is_not_saved() -> None:
    with pytest.raises(EmptyPostError):
        save(PostSaveSchema(html="<p><br></p>"))


def test_foreign_media_is_not_attached() -> None:
    stranger = PostMedia(id=9, owner_id=2, kind="photo", path="posts/c.jpg")

    with pytest.raises(PostMediaNotFoundError):
        save(PostSaveSchema(html="<p>Текст</p>", media_ids=[9]), [stranger])


def test_viewer_marks_come_from_sets() -> None:
    post = save(PostSaveSchema(html="<p>Текст</p>"))
    post.author = AUTHOR
    post.likes_count = 0
    post.comments_count = 0
    post.reposts_count = 0
    post.views_count = 0
    post.created_at = datetime(2026, 10, 10, tzinfo=timezone.utc)

    schema = PostSchema.for_viewer(post, ViewerMarks(liked={post.id}, following={AUTHOR.id}))

    assert schema.liked is True
    assert schema.saved is False
    assert schema.following is True


class FakeRepostRepository:
    """Сохранённые репосты и пересчитанные оригиналы."""

    def __init__(self) -> None:
        self.refreshed: list[int] = []

    async def add(self, post: Post) -> Post:
        return post

    async def refresh_reposts(self, post_id: int) -> None:
        self.refreshed.append(post_id)


def test_repost_of_repost_points_to_original() -> None:
    posts = FakeRepostRepository()
    original = Post(id=1, author_id=2)
    repost = Post(id=2, author_id=3, repost_of_id=1, repost_of=original)

    simple = asyncio.run(CreateRepostUseCase(posts, FakeNotify()).execute(AUTHOR, repost, RepostSaveSchema()))
    commented = asyncio.run(
        CreateRepostUseCase(posts, FakeNotify()).execute(
            AUTHOR, original, RepostSaveSchema(html="<p>Советую</p>")
        )
    )

    assert simple.repost_of_id == original.id
    assert simple.html == ""
    assert simple.status == PostStatus.PUBLISHED
    assert commented.html == "<p>Советую</p>"
    assert posts.refreshed == [original.id, original.id]


class FakeCommentRepository:
    """Комментарии одного поста в списке."""

    def __init__(self) -> None:
        self.items: list[PostComment] = []

    async def get_by_id(self, comment_id: int) -> PostComment | None:
        return next((item for item in self.items if item.id == comment_id), None)

    async def add(self, comment: PostComment) -> PostComment:
        comment.id = len(self.items) + 1
        self.items.append(comment)

        return comment


def comment(comments: FakeCommentRepository, post: Post, reply_to_id: int | None = None) -> PostComment:
    usecase = CreateCommentUseCase(comments, FakeNotify())
    payload = CommentSaveSchema(text="  Есть время?  ", reply_to_id=reply_to_id)

    return asyncio.run(usecase.execute(AUTHOR, post, payload))


def test_replies_go_into_thread_of_root_comment() -> None:
    post = Post(id=1, author_id=AUTHOR.id)
    comments = FakeCommentRepository()

    root = comment(comments, post)
    reply = comment(comments, post, reply_to_id=root.id)
    reply_to_reply = comment(comments, post, reply_to_id=reply.id)

    assert root.parent_id is None
    assert root.text == "Есть время?"
    assert reply.parent_id == root.id
    assert reply_to_reply.parent_id == root.id
    assert reply_to_reply.reply_to_id == reply.id


def test_reply_to_comment_of_other_post_is_rejected() -> None:
    comments = FakeCommentRepository()
    other = comment(comments, Post(id=2, author_id=AUTHOR.id))

    with pytest.raises(CommentNotFoundError):
        comment(comments, Post(id=1, author_id=AUTHOR.id), reply_to_id=other.id)
