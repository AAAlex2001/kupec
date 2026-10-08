"""Сценарии блокировки собеседника из переписки."""

from app.chats.models import Conversation, UserBlock
from app.chats.services.repo import BlockRepository
from app.users.models import User


class BlockUserUseCase:
    """Заблокировать собеседника: он больше не сможет писать. Повторная блокировка ничего не меняет."""

    def __init__(self, blocks: BlockRepository) -> None:
        self.blocks = blocks

    async def execute(self, user: User, conversation: Conversation) -> None:
        """Заблокировать собеседника по переписке."""

        companion_id = conversation.companion(user.id).id
        if await self.blocks.get(user.id, companion_id) is not None:
            return

        await self.blocks.add(UserBlock(blocker_id=user.id, blocked_id=companion_id))


class UnblockUserUseCase:
    """Снять блокировку с собеседника. Если её нет, ничего не происходит."""

    def __init__(self, blocks: BlockRepository) -> None:
        self.blocks = blocks

    async def execute(self, user: User, conversation: Conversation) -> None:
        """Разблокировать собеседника по переписке."""

        block = await self.blocks.get(user.id, conversation.companion(user.id).id)
        if block is not None:
            await self.blocks.delete(block)
