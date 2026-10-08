"""Сценарий подсчёта просмотра объявления."""

from datetime import datetime, timezone

from app.listings.models import Listing
from app.listings.services.repo import ListingRepository, ListingViewRepository


class CountViewUseCase:
    """Засчитать просмотр: один посетитель — один раз в сутки, автор не считается."""

    def __init__(self, listings: ListingRepository, views: ListingViewRepository) -> None:
        self.listings = listings
        self.views = views

    async def execute(self, listing: Listing, visitor: str, user_id: int | None) -> None:
        """Прибавить просмотр, если посетитель сегодня это объявление ещё не смотрел."""

        if user_id == listing.owner_id:
            return

        today = datetime.now(timezone.utc).date()
        if await self.views.add_once(listing.id, visitor, today):
            await self.listings.add_view(listing.id)
