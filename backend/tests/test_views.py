"""Тесты подсчёта просмотров объявлений, постов и статей без БД."""

import asyncio
from datetime import date

from app.articles.models import Article
from app.articles.services.usecases.count_view import CountArticleViewUseCase
from app.catalog.models import ListingKind
from app.listings.models import Listing, ListingStatus
from app.listings.services.usecases.count_view import CountViewUseCase
from app.posts.models import Post
from app.posts.services.usecases.count_view import CountPostViewUseCase

OWNER_ID = 2


class FakeListingRepository:
    """Считает, сколько раз прибавили просмотр. Подходит и для постов, и для статей."""

    def __init__(self) -> None:
        self.added = 0

    async def add_view(self, listing_id: int) -> None:
        self.added += 1


class FakeViewRepository:
    """Просмотры в множестве: объявление, посетитель, день."""

    def __init__(self) -> None:
        self.items: set[tuple[int, str, date]] = set()

    async def add_once(self, listing_id: int, visitor: str, day: date) -> bool:
        key = (listing_id, visitor, day)
        if key in self.items:
            return False

        self.items.add(key)
        return True


def make_listing() -> Listing:
    return Listing(
        id=1, owner_id=OWNER_ID, kind=ListingKind.PRODUCT, title="Огурцы", status=ListingStatus.PUBLISHED
    )


def test_visitor_counts_once_a_day_and_owner_never() -> None:
    listings = FakeListingRepository()
    usecase = CountViewUseCase(listings, FakeViewRepository())
    listing = make_listing()

    for _ in range(5):
        asyncio.run(usecase.execute(listing, "guest:abc", None))
    asyncio.run(usecase.execute(listing, "user:7", 7))
    asyncio.run(usecase.execute(listing, f"user:{OWNER_ID}", OWNER_ID))

    assert listings.added == 2


def test_post_view_counts_once_a_day_and_author_never() -> None:
    posts = FakeListingRepository()
    usecase = CountPostViewUseCase(posts, FakeViewRepository())
    post = Post(id=1, author_id=OWNER_ID)

    for _ in range(5):
        asyncio.run(usecase.execute(post, "guest:abc", None))
    asyncio.run(usecase.execute(post, "user:7", 7))
    asyncio.run(usecase.execute(post, f"user:{OWNER_ID}", OWNER_ID))

    assert posts.added == 2


def test_article_view_counts_guests_and_users_once_a_day() -> None:
    articles = FakeListingRepository()
    usecase = CountArticleViewUseCase(articles, FakeViewRepository())
    article = Article(id=1)

    for _ in range(5):
        asyncio.run(usecase.execute(article, "guest:abc"))
    asyncio.run(usecase.execute(article, "user:7"))
    asyncio.run(usecase.execute(article, "user:7"))

    assert articles.added == 2
