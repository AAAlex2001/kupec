"""Сценарий нового отзыва по объявлению."""

from app.listings.models import Listing
from app.listings.services.repo import ListingRepository
from app.reviews.models import Review
from app.reviews.schemas import ReviewCreateSchema
from app.reviews.services.exceptions import ReviewNotAllowedError
from app.reviews.services.repo import ReviewPhotoRepository, ReviewRepository
from app.reviews.services.usecases.save_review import SaveReviewUseCase
from app.users.models import User


class CreateReviewUseCase(SaveReviewUseCase):
    """Оставить отзыв: только покупатель, который писал автору, и только один раз."""

    def __init__(
        self,
        reviews: ReviewRepository,
        photos: ReviewPhotoRepository,
        listings: ListingRepository,
    ) -> None:
        super().__init__(reviews, photos)
        self.listings = listings

    async def check_allowed(self, user: User, listing: Listing | None) -> Listing:
        """Объявление, о котором можно оставить отзыв. Иначе — ReviewNotAllowedError."""

        if listing is None:
            raise ReviewNotAllowedError("Объявление не найдено")

        if listing.owner_id == user.id:
            raise ReviewNotAllowedError("Нельзя оставить отзыв о своём объявлении")

        if not await self.reviews.has_conversation(listing.id, user.id):
            raise ReviewNotAllowedError("Отзыв можно оставить после переписки с автором")

        if await self.reviews.find(listing.id, user.id) is not None:
            raise ReviewNotAllowedError("Вы уже оставили отзыв об этом объявлении")

        return listing

    async def execute(self, user: User, payload: ReviewCreateSchema) -> Review:
        """Вернуть новый отзыв: на проверке или сразу отклонённый автопроверкой."""

        listing = await self.check_allowed(user, await self.listings.get_by_id(payload.listing_id))
        photos = await self.check_photos(user.id, payload.photo_ids, None)

        review = Review(listing_id=listing.id, author_id=user.id, seller_id=listing.owner_id)
        self.fill(review, payload, photos)

        return await self.reviews.add(review)
