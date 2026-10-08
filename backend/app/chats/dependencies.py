"""Переписка: репозитории, фабрики сценариев и загрузка своей переписки по id из пути."""

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import require_user
from app.chats.models import Conversation
from app.chats.services.repo import BlockRepository, ConversationRepository, MessageRepository
from app.chats.services.usecases.manage_block import BlockUserUseCase, UnblockUserUseCase
from app.chats.services.usecases.open_conversation import OpenConversationUseCase
from app.chats.services.usecases.send_message import SendMessageUseCase
from app.chats.services.usecases.start_conversation import StartConversationUseCase
from app.core.database import get_session
from app.listings.dependencies import get_listing_repository
from app.listings.services.repo import ListingRepository
from app.users.models import User


def get_conversation_repository(
    session: AsyncSession = Depends(get_session),
) -> ConversationRepository:
    """Репозиторий переписок с сессией текущего запроса."""

    return ConversationRepository(session)


def get_message_repository(
    session: AsyncSession = Depends(get_session),
) -> MessageRepository:
    """Репозиторий сообщений с сессией текущего запроса."""

    return MessageRepository(session)


def get_block_repository(
    session: AsyncSession = Depends(get_session),
) -> BlockRepository:
    """Репозиторий блокировок с сессией текущего запроса."""

    return BlockRepository(session)


def get_block_usecase(
    blocks: BlockRepository = Depends(get_block_repository),
) -> BlockUserUseCase:
    """Сценарий блокировки собеседника."""

    return BlockUserUseCase(blocks)


def get_unblock_usecase(
    blocks: BlockRepository = Depends(get_block_repository),
) -> UnblockUserUseCase:
    """Сценарий снятия блокировки."""

    return UnblockUserUseCase(blocks)


def get_start_conversation_usecase(
    conversations: ConversationRepository = Depends(get_conversation_repository),
    listings: ListingRepository = Depends(get_listing_repository),
) -> StartConversationUseCase:
    """Сценарий «Написать» по объявлению."""

    return StartConversationUseCase(conversations, listings)


def get_open_conversation_usecase(
    conversations: ConversationRepository = Depends(get_conversation_repository),
    messages: MessageRepository = Depends(get_message_repository),
) -> OpenConversationUseCase:
    """Сценарий открытия переписки."""

    return OpenConversationUseCase(conversations, messages)


def get_send_message_usecase(
    conversations: ConversationRepository = Depends(get_conversation_repository),
    messages: MessageRepository = Depends(get_message_repository),
    blocks: BlockRepository = Depends(get_block_repository),
) -> SendMessageUseCase:
    """Сценарий отправки сообщения."""

    return SendMessageUseCase(conversations, messages, blocks)


async def get_own_conversation(
    conversation_id: int,
    user: User = Depends(require_user),
    conversations: ConversationRepository = Depends(get_conversation_repository),
) -> Conversation:
    """Своя переписка по id из пути. Чужая выглядит как несуществующая — 404."""

    conversation = await conversations.get_by_id(conversation_id)
    if conversation is None or user.id not in (conversation.buyer_id, conversation.seller_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Переписка не найдена",
        )

    return conversation
