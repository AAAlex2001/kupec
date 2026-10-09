"""Тесты отзывов без БД: кто может оставить, автопроверка и модерация."""

import asyncio

import pytest

from app.catalog.models import ListingKind
from app.listings.models import Listing, ListingStatus
from app.reviews.models import Review, ReviewPhoto, ReviewStatus
from app.reviews.schemas import ReviewCreateSchema, ReviewSchema
from app.reviews.services.exceptions import ReviewNotAllowedError
from app.reviews.services.usecases.create_review import CreateReviewUseCase
from app.reviews.services.usecases.moderate_review import ApproveReviewUseCase, RejectReviewUseCase
from app.users.models import User

BUYER = User(id=1, email="anna@mail.ru", name="Анна")
SELLER = User(id=2, email="oleg@mail.ru", name="Олег")
LISTING = Listing(
    id=5, owner_id=SELLER.id, kind=ListingKind.PRODUCT, title="Огурцы", status=ListingStatus.PUBLISHED
)


class FakeListingRepository:
    async def get_by_id(self, listing_id: int) -> Listing | None:
        return LISTING if listing_id == LISTING.id else None


class FakePhotoRepository:
    async def list_usable(
        self, owner_id: int, photo_ids: list[int], review_id: int | None
    ) -> list[ReviewPhoto]:
        return []


class FakeReviewRepository:
    """Отзывы в списке и покупатели, которые писали продавцу."""

    def __init__(self, chatted: set[int]) -> None:
        self.items: list[Review] = []
        self.chatted = chatted
        self.refreshed: list[int] = []

    async def has_conversation(self, listing_id: int, buyer_id: int) -> bool:
        return buyer_id in self.chatted

    async def find(self, listing_id: int, author_id: int) -> Review | None:
        for review in self.items:
            if review.listing_id == listing_id and review.author_id == author_id:
                return review

        return None

    async def add(self, review: Review) -> Review:
        review.id = len(self.items) + 1
        self.items.append(review)

        return review

    async def save(self, review: Review) -> Review:
        return review

    async def refresh_seller_rating(self, seller_id: int) -> None:
        self.refreshed.append(seller_id)


def create(reviews: FakeReviewRepository, user: User, text: str | None = "Хрустящие") -> Review:
    usecase = CreateReviewUseCase(reviews, FakePhotoRepository(), FakeListingRepository())
    payload = ReviewCreateSchema(listing_id=LISTING.id, rating=5, text=text)

    return asyncio.run(usecase.execute(user, payload))


def test_review_needs_conversation_and_only_once() -> None:
    reviews = FakeReviewRepository(chatted={BUYER.id})

    with pytest.raises(ReviewNotAllowedError):
        create(FakeReviewRepository(chatted=set()), BUYER)

    review = create(reviews, BUYER)
    assert review.status == ReviewStatus.PENDING
    assert review.seller_id == SELLER.id

    with pytest.raises(ReviewNotAllowedError):
        create(reviews, BUYER)


def test_seller_cannot_review_own_listing() -> None:
    with pytest.raises(ReviewNotAllowedError):
        create(FakeReviewRepository(chatted={SELLER.id}), SELLER)


def test_contacts_in_text_reject_review_at_once() -> None:
    reviews = FakeReviewRepository(chatted={BUYER.id})

    review = create(reviews, BUYER, text="Всё отлично, звоните +7 999 123-45-67")

    assert review.status == ReviewStatus.REJECTED
    assert review.reject_reason is not None


def test_moderation_publishes_or_rejects_and_refreshes_rating() -> None:
    reviews = FakeReviewRepository(chatted={BUYER.id})
    review = create(reviews, BUYER)

    asyncio.run(ApproveReviewUseCase(reviews).execute(review))
    assert review.status == ReviewStatus.PUBLISHED

    asyncio.run(RejectReviewUseCase(reviews).execute(review, "  Оскорбления  "))
    assert review.status == ReviewStatus.REJECTED
    assert review.reject_reason == "Оскорбления"
    assert reviews.refreshed == [SELLER.id, SELLER.id]


def test_review_response_does_not_reveal_author() -> None:
    assert "author_id" not in ReviewSchema.model_fields
    assert Review(anonymous=True, author=BUYER).author_name == "Покупатель"
