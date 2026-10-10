"""Тесты статей блога и новостей без БД."""

import asyncio

import pytest

from app.articles.models import Article, ArticleSection, ArticleStatus
from app.articles.schemas import ArticleSaveSchema
from app.articles.services.exceptions import ArticleSlugTakenError
from app.articles.services.usecases.comment_article import CreateArticleCommentUseCase
from app.articles.services.usecases.save_article import CreateArticleUseCase, UpdateArticleUseCase
from app.notifications.models import NotificationKind
from app.posts.models import PostComment
from app.posts.schemas import CommentSaveSchema
from app.posts.services.exceptions import CommentNotFoundError
from app.users.models import User
from tests.fakes import FakeNotify

READER = User(id=2, email="ivan@mail.ru", name="Иван")
ARTICLE = Article(id=7, section="news", slug="moshenniki", title="Мошенники")


class FakeComments:
    """Комментарии в памяти: у нового ответа подставляется тот, кому ответили."""

    def __init__(self, items: list[PostComment] | None = None) -> None:
        self.items = items or []

    async def get_by_id(self, comment_id: int) -> PostComment | None:
        return next((item for item in self.items if item.id == comment_id), None)

    async def add(self, comment: PostComment) -> PostComment:
        comment.id = 100 + len(self.items)
        comment.reply_to = await self.get_by_id(comment.reply_to_id) if comment.reply_to_id else None
        self.items.append(comment)
        return comment


class FakeArticles:
    """Статьи в памяти."""

    def __init__(self) -> None:
        self.items: list[Article] = []

    async def slug_taken(self, slug: str, exclude_id: int | None) -> bool:
        return any(item.slug == slug and item.id != exclude_id for item in self.items)

    async def add(self, article: Article) -> Article:
        article.id = len(self.items) + 1
        self.items.append(article)
        return article

    async def save(self, article: Article) -> Article:
        return article


def payload(**changes: object) -> ArticleSaveSchema:
    fields = {
        "section": ArticleSection.NEWS,
        "slug": "kak-prodat-veshch",
        "title": "Как продать вещь",
        "html": "<h2>Фото</h2><ul><li>Свет</li></ul><script>alert(1)</script>",
        "publish": True,
    }

    return ArticleSaveSchema(**(fields | changes))


def test_published_article_gets_date_and_clean_html() -> None:
    article = asyncio.run(CreateArticleUseCase(FakeArticles()).execute(payload()))

    assert article.status == ArticleStatus.PUBLISHED
    assert article.published_at is not None
    assert article.html == "<h2>Фото</h2><ul><li>Свет</li></ul>"
    assert article.path == "/news/kak-prodat-veshch"


def test_draft_has_no_publication_date() -> None:
    article = asyncio.run(CreateArticleUseCase(FakeArticles()).execute(payload(publish=False)))

    assert article.status == ArticleStatus.DRAFT
    assert article.published_at is None


def test_republishing_keeps_first_publication_date() -> None:
    articles = FakeArticles()
    article = asyncio.run(CreateArticleUseCase(articles).execute(payload()))
    first = article.published_at

    asyncio.run(UpdateArticleUseCase(articles).execute(article, payload(publish=False)))
    asyncio.run(UpdateArticleUseCase(articles).execute(article, payload(title="Новый заголовок")))

    assert article.published_at == first
    assert article.title == "Новый заголовок"


def test_slug_must_be_unique() -> None:
    articles = FakeArticles()
    asyncio.run(CreateArticleUseCase(articles).execute(payload()))

    with pytest.raises(ArticleSlugTakenError):
        asyncio.run(CreateArticleUseCase(articles).execute(payload(section=ArticleSection.BLOG)))


def test_slug_allows_only_latin_and_dashes() -> None:
    with pytest.raises(ValueError):
        payload(slug="Как продать")


@pytest.mark.parametrize("section", [ArticleSection.NEWS, ArticleSection.BLOG])
def test_article_comment_without_reply_notifies_nobody(section: ArticleSection) -> None:
    notify = FakeNotify()
    usecase = CreateArticleCommentUseCase(FakeComments(), notify)

    article = Article(id=7, section=section, slug="article", title="Статья")
    comment = asyncio.run(usecase.execute(READER, article, CommentSaveSchema(text=" Полезно ")))

    assert (comment.article_id, comment.post_id, comment.text) == (7, None, "Полезно")
    assert notify.sent == []


def test_reply_in_article_goes_to_thread_and_notifies_with_article() -> None:
    root = PostComment(id=1, article_id=7, author_id=5, parent_id=None, text="Вопрос")
    notify = FakeNotify()
    usecase = CreateArticleCommentUseCase(FakeComments([root]), notify)

    reply = asyncio.run(
        usecase.execute(READER, ARTICLE, CommentSaveSchema(text="Ответ", reply_to_id=1))
    )

    assert reply.parent_id == 1
    assert notify.sent[0].kind == NotificationKind.REPLY
    assert (notify.sent[0].user_id, notify.sent[0].article_id) == (5, 7)


def test_reply_to_comment_of_other_article_is_rejected() -> None:
    other = PostComment(id=1, article_id=8, author_id=5, parent_id=None, text="Чужой")
    usecase = CreateArticleCommentUseCase(FakeComments([other]), FakeNotify())

    with pytest.raises(CommentNotFoundError):
        asyncio.run(usecase.execute(READER, ARTICLE, CommentSaveSchema(text="Ответ", reply_to_id=1)))


def test_article_reply_cannot_attach_to_post_comment() -> None:
    other = PostComment(id=1, post_id=7, author_id=5, text="Комментарий к посту")
    usecase = CreateArticleCommentUseCase(FakeComments([other]), FakeNotify())

    with pytest.raises(CommentNotFoundError):
        asyncio.run(usecase.execute(READER, ARTICLE, CommentSaveSchema(text="Ответ", reply_to_id=1)))


def test_nested_article_reply_keeps_original_thread() -> None:
    reply = PostComment(id=2, article_id=7, author_id=5, parent_id=1, text="Ответ")
    usecase = CreateArticleCommentUseCase(FakeComments([reply]), FakeNotify())

    created = asyncio.run(
        usecase.execute(READER, ARTICLE, CommentSaveSchema(text="Уточнение", reply_to_id=2))
    )

    assert (created.parent_id, created.reply_to_id, created.article_id) == (1, 2, 7)
