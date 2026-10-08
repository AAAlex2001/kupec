"""Сценарий правки своего объявления."""

from app.core.uploads import remove_image
from app.listings.models import Listing
from app.listings.schemas import ListingCreateSchema
from app.listings.services.usecases.save_listing import SaveListingUseCase
from app.users.models import User


class UpdateListingUseCase(SaveListingUseCase):
    """Изменить объявление. Фото, убранные из формы, удаляются из базы и с диска."""

    async def execute(self, user: User, listing: Listing, payload: ListingCreateSchema) -> Listing:
        """Вернуть изменённое объявление. Бросает InvalidListingError с ошибками по полям."""

        photos, phone = await self.check(user, payload, listing.id)
        removed_paths = [photo.path for photo in listing.photos if photo not in photos]

        self.fill(listing, payload, photos, phone)
        saved = await self.listings.save(listing)

        for path in removed_paths:
            remove_image(path)

        return saved
