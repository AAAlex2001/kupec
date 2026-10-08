"""Сценарий открытия переписки."""

from datetime import datetime, timezone

from app.chats.models import Conversation, Message
from app.chats.services.repo import ConversationRepository, MessageRepository
from app.users.models import User


class OpenConversationUseCase:
    """Показать сообщения переписки и отметить входящие прочитанными."""

    def __init__(
        self, conversations: ConversationRepository, messages: MessageRepository
    ) -> None:
        self.conversations = conversations
        self.messages = messages

    async def execute(
        self, user: User, conversation: Conversation
    ) -> tuple[Conversation, list[Message]]:
        """Переписка с обнулённым счётчиком непрочитанных и все её сообщения."""

        if conversation.unread_for(user.id) > 0:
            await self.messages.mark_read(conversation.id, user.id, datetime.now(timezone.utc))

            if user.id == conversation.buyer_id:
                conversation.buyer_unread = 0
            else:
                conversation.seller_unread = 0

            conversation = await self.conversations.save(conversation)

        messages = await self.messages.list_for_conversation(conversation.id)

        return conversation, messages
