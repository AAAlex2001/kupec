"""Сценарий «Написать» по объявлению."""

from app.chats.models import Conversation
from app.chats.services.exceptions import OwnListingError
from app.chats.services.repo import ConversationRepository
from app.listings.models import ListingStatus
from app.listings.services.exceptions import ListingNotFoundError
from app.listings.services.repo import ListingRepository
from app.users.models import User


class StartConversationUseCase:
    """Открыть переписку с автором объявления. Если она уже есть, вернуть её."""

    def __init__(
        self, conversations: ConversationRepository, listings: ListingRepository
    ) -> None:
        self.conversations = conversations
        self.listings = listings

    async def execute(self, user: User, listing_id: int) -> Conversation:
        """Переписка по объявлению. Неопубликованное — ListingNotFoundError, своё — OwnListingError."""

        listing = await self.listings.get_by_id(listing_id)
        if listing is None or listing.status != ListingStatus.PUBLISHED:
            raise ListingNotFoundError("Объявление не найдено")

        if listing.owner_id == user.id:
            raise OwnListingError("Это ваше объявление")

        conversation = await self.conversations.find(listing.id, user.id)
        if conversation is not None:
            return conversation

        return await self.conversations.add(
            Conversation(listing_id=listing.id, buyer_id=user.id, seller_id=listing.owner_id)
        )
