"""Тесты переписки без БД."""

import asyncio
from datetime import datetime, timezone

import pytest

from app.catalog.models import ListingKind
from app.chats.models import Conversation, Message, UserBlock
from app.chats.services.exceptions import BlockedError, EmptyMessageError, OwnListingError
from app.chats.services.usecases.manage_block import BlockUserUseCase, UnblockUserUseCase
from app.chats.services.usecases.open_conversation import OpenConversationUseCase
from app.chats.services.usecases.send_message import SendMessageUseCase
from app.chats.services.usecases.start_conversation import StartConversationUseCase
from app.listings.models import Listing, ListingStatus
from app.listings.services.exceptions import ListingNotFoundError
from app.users.models import User

BUYER = User(id=1, email="anna@mail.ru", name="Анна")
SELLER = User(id=2, email="oleg@mail.ru", name="Олег")


class FakeListingRepository:
    """Объявления в словаре по id."""

    def __init__(self, listings: list[Listing]) -> None:
        self.items = {listing.id: listing for listing in listings}

    async def get_by_id(self, listing_id: int) -> Listing | None:
        return self.items.get(listing_id)


class FakeConversationRepository:
    """Переписки в списке."""

    def __init__(self) -> None:
        self.items: list[Conversation] = []

    async def find(self, listing_id: int, buyer_id: int) -> Conversation | None:
        for conversation in self.items:
            if conversation.listing_id == listing_id and conversation.buyer_id == buyer_id:
                return conversation

        return None

    async def add(self, conversation: Conversation) -> Conversation:
        conversation.id = len(self.items) + 1
        self.items.append(conversation)

        return conversation

    async def save(self, conversation: Conversation) -> Conversation:
        return conversation


class FakeMessageRepository:
    """Сообщения в списке."""

    def __init__(self) -> None:
        self.items: list[Message] = []

    async def list_for_conversation(self, conversation_id: int) -> list[Message]:
        return [message for message in self.items if message.conversation_id == conversation_id]

    async def mark_read(self, conversation_id: int, reader_id: int, read_at: datetime) -> None:
        for message in self.items:
            if message.conversation_id == conversation_id and message.sender_id != reader_id:
                message.read_at = message.read_at or read_at

    async def add(self, message: Message) -> Message:
        message.id = len(self.items) + 1
        message.created_at = datetime.now(timezone.utc)
        self.items.append(message)

        return message


class FakeBlockRepository:
    """Блокировки в словаре по паре «кто — кого»."""

    def __init__(self) -> None:
        self.items: dict[tuple[int, int], UserBlock] = {}

    async def get(self, blocker_id: int, blocked_id: int) -> UserBlock | None:
        return self.items.get((blocker_id, blocked_id))

    async def add(self, block: UserBlock) -> None:
        self.items[(block.blocker_id, block.blocked_id)] = block

    async def delete(self, block: UserBlock) -> None:
        del self.items[(block.blocker_id, block.blocked_id)]


def make_listing(status: ListingStatus = ListingStatus.PUBLISHED) -> Listing:
    return Listing(
        id=5, owner_id=SELLER.id, kind=ListingKind.PRODUCT, title="Огурцы", status=status
    )


def start(user: User, listing: Listing, conversations: FakeConversationRepository) -> Conversation:
    usecase = StartConversationUseCase(conversations, FakeListingRepository([listing]))

    return asyncio.run(usecase.execute(user, listing.id))


def make_conversation() -> Conversation:
    return Conversation(
        id=1,
        listing_id=5,
        buyer_id=BUYER.id,
        seller_id=SELLER.id,
        buyer=BUYER,
        seller=SELLER,
        buyer_unread=0,
        seller_unread=0,
    )


def sender(
    messages: FakeMessageRepository | None = None, blocks: FakeBlockRepository | None = None
) -> SendMessageUseCase:
    return SendMessageUseCase(
        FakeConversationRepository(),
        messages or FakeMessageRepository(),
        blocks or FakeBlockRepository(),
    )


def test_writing_again_returns_the_same_conversation() -> None:
    conversations = FakeConversationRepository()

    first = start(BUYER, make_listing(), conversations)
    second = start(BUYER, make_listing(), conversations)

    assert first is second
    assert (first.buyer_id, first.seller_id) == (BUYER.id, SELLER.id)


def test_cannot_write_on_own_or_unpublished_listing() -> None:
    with pytest.raises(OwnListingError):
        start(SELLER, make_listing(), FakeConversationRepository())

    with pytest.raises(ListingNotFoundError):
        start(BUYER, make_listing(ListingStatus.ARCHIVED), FakeConversationRepository())


def test_message_updates_preview_and_companion_unread() -> None:
    conversation = make_conversation()
    usecase = sender()

    asyncio.run(usecase.execute(BUYER, conversation, "  Здравствуйте! Ещё продаёте?  "))
    asyncio.run(usecase.execute(BUYER, conversation, "Заберу сегодня"))

    assert conversation.last_message_text == "Заберу сегодня"
    assert conversation.seller_unread == 2
    assert conversation.buyer_unread == 0


def test_empty_message_is_rejected() -> None:
    with pytest.raises(EmptyMessageError):
        asyncio.run(sender().execute(BUYER, make_conversation(), "   "))


def test_opening_marks_incoming_messages_read() -> None:
    conversation = make_conversation()
    conversations = FakeConversationRepository()
    messages = FakeMessageRepository()
    asyncio.run(sender(messages).execute(BUYER, conversation, "Привет"))

    asyncio.run(OpenConversationUseCase(conversations, messages).execute(BUYER, conversation))
    assert conversation.seller_unread == 1
    assert messages.items[0].read_at is None

    _, opened = asyncio.run(
        OpenConversationUseCase(conversations, messages).execute(SELLER, conversation)
    )
    assert conversation.seller_unread == 0
    assert opened[0].read_at is not None


def test_nobody_can_write_after_block_until_unblock() -> None:
    conversation = make_conversation()
    blocks = FakeBlockRepository()
    usecase = sender(blocks=blocks)

    asyncio.run(BlockUserUseCase(blocks).execute(SELLER, conversation))

    with pytest.raises(BlockedError):
        asyncio.run(usecase.execute(BUYER, conversation, "Привет"))
    with pytest.raises(BlockedError):
        asyncio.run(usecase.execute(SELLER, conversation, "Привет"))

    asyncio.run(UnblockUserUseCase(blocks).execute(SELLER, conversation))
    asyncio.run(usecase.execute(BUYER, conversation, "Привет"))
    assert conversation.last_message_text == "Привет"
