"""Сценарий отправки сообщения."""

from app.chats.models import Conversation, Message
from app.chats.services.exceptions import BlockedError
from app.chats.services.repo import BlockRepository, ConversationRepository, MessageRepository
from app.chats.services.validators import normalize_message_text
from app.users.models import User


class SendMessageUseCase:
    """Отправить сообщение собеседнику. У него прибавляется непрочитанное."""

    def __init__(
        self,
        conversations: ConversationRepository,
        messages: MessageRepository,
        blocks: BlockRepository,
    ) -> None:
        self.conversations = conversations
        self.messages = messages
        self.blocks = blocks

    async def execute(self, user: User, conversation: Conversation, text: str) -> Message:
        """Сохранить сообщение. Пустое — EmptyMessageError, при блокировке — BlockedError."""

        text = normalize_message_text(text)

        companion_id = conversation.companion(user.id).id
        if await self.blocks.get(companion_id, user.id) or await self.blocks.get(
            user.id, companion_id
        ):
            raise BlockedError("Переписка с этим пользователем недоступна")

        message = await self.messages.add(
            Message(conversation_id=conversation.id, sender_id=user.id, text=text)
        )

        conversation.last_message_text = message.text
        conversation.last_message_at = message.created_at
        if user.id == conversation.buyer_id:
            conversation.seller_unread += 1
        else:
            conversation.buyer_unread += 1

        await self.conversations.save(conversation)

        return message
