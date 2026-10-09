"""Сценарий размещения объявления: черновик или сразу публикация."""

from app.listings.models import Listing
from app.listings.schemas import ListingCreateSchema
from app.listings.services.usecases.save_listing import SaveListingUseCase
from app.users.models import User


class CreateListingUseCase(SaveListingUseCase):
    """Проверить форму, привязать загруженные фото и сохранить новое объявление."""

    async def execute(self, user: User, payload: ListingCreateSchema) -> Listing:
        """Вернуть сохранённое объявление. Бросает InvalidListingError с ошибками по полям."""

        checked = await self.check(user, payload, None)

        listing = Listing(owner_id=user.id)
        self.fill(listing, payload, checked)

        return await self.listings.add(listing)
