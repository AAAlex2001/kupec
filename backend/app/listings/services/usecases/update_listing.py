"""Сценарий правки объявления: автором или администратором."""

from app.core.uploads import remove_image
from app.listings.models import Listing
from app.listings.schemas import ListingCreateSchema
from app.listings.services.usecases.save_listing import SaveListingUseCase


class UpdateListingUseCase(SaveListingUseCase):
    """Изменить объявление. Фото, убранные из формы, удаляются из базы и с диска."""

    async def execute(self, listing: Listing, payload: ListingCreateSchema) -> Listing:
        """Вернуть изменённое объявление. Фото проверяются как фото автора объявления."""

        checked = await self.check(listing.owner, payload, listing.id)
        removed_paths = [photo.path for photo in listing.photos if photo not in checked.photos]

        self.fill(listing, payload, checked)
        saved = await self.listings.save(listing)

        for path in removed_paths:
            remove_image(path)

        return saved
