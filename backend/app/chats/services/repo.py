"""Репозитории переписки: запросы к таблицам conversations и messages."""

from datetime import datetime

from sqlalchemy import and_, case, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.chats.models import Conversation, Message, UserBlock
from app.listings.models import Listing
from app.users.models import User


class ConversationRepository:
    """Доступ к таблице conversations. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, conversation_id: int) -> Conversation | None:
        """Переписка по id или None."""

        return await self.db.get(Conversation, conversation_id)

    async def find(self, listing_id: int, buyer_id: int) -> Conversation | None:
        """Переписка покупателя по объявлению или None."""

        stmt = select(Conversation).where(
            Conversation.listing_id == listing_id, Conversation.buyer_id == buyer_id
        )
        result = await self.db.execute(stmt)

        return result.unique().scalar_one_or_none()

    async def list_for_user(self, user_id: int, search: str | None) -> list[Conversation]:
        """Переписки пользователя, свежие первыми. Продавец видит только те, где уже написали."""

        conditions = [
            or_(
                Conversation.buyer_id == user_id,
                and_(
                    Conversation.seller_id == user_id,
                    Conversation.last_message_at.is_not(None),
                ),
            )
        ]

        if search:
            conditions.append(
                or_(
                    Conversation.listing.has(Listing.title.icontains(search, autoescape=True)),
                    and_(
                        Conversation.seller_id == user_id,
                        Conversation.buyer.has(User.name.icontains(search, autoescape=True)),
                    ),
                    and_(
                        Conversation.buyer_id == user_id,
                        Conversation.seller.has(User.name.icontains(search, autoescape=True)),
                    ),
                )
            )

        stmt = (
            select(Conversation)
            .where(*conditions)
            .order_by(
                func.coalesce(Conversation.last_message_at, Conversation.created_at).desc(),
                Conversation.id.desc(),
            )
        )
        result = await self.db.execute(stmt)

        return list(result.unique().scalars().all())

    async def count_unread(self, user_id: int) -> int:
        """Сколько непрочитанных сообщений у пользователя во всех переписках."""

        unread = case(
            (Conversation.buyer_id == user_id, Conversation.buyer_unread),
            else_=Conversation.seller_unread,
        )
        stmt = select(func.coalesce(func.sum(unread), 0)).where(
            or_(Conversation.buyer_id == user_id, Conversation.seller_id == user_id)
        )
        count = await self.db.scalar(stmt)

        return int(count or 0)

    async def add(self, conversation: Conversation) -> Conversation:
        """Сохранить новую переписку."""

        self.db.add(conversation)
        await self.db.commit()

        return await self.reload(conversation.id)

    async def save(self, conversation: Conversation) -> Conversation:
        """Сохранить изменения переписки."""

        await self.db.commit()

        return await self.reload(conversation.id)

    async def reload(self, conversation_id: int) -> Conversation:
        """Перечитать переписку вместе с объявлением и собеседниками."""

        stmt = (
            select(Conversation)
            .where(Conversation.id == conversation_id)
            .execution_options(populate_existing=True)
        )
        result = await self.db.execute(stmt)

        return result.unique().scalar_one()


class BlockRepository:
    """Доступ к таблице user_blocks. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get(self, blocker_id: int, blocked_id: int) -> UserBlock | None:
        """Блокировка blocked_id пользователем blocker_id или None."""

        return await self.db.get(UserBlock, (blocker_id, blocked_id))

    async def add(self, block: UserBlock) -> None:
        """Заблокировать."""

        self.db.add(block)
        await self.db.commit()

    async def delete(self, block: UserBlock) -> None:
        """Разблокировать."""

        await self.db.delete(block)
        await self.db.commit()


class MessageRepository:
    """Доступ к таблице messages. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_for_conversation(self, conversation_id: int) -> list[Message]:
        """Сообщения переписки по порядку отправки."""

        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at, Message.id)
        )
        result = await self.db.execute(stmt)

        return list(result.scalars().all())

    async def mark_read(self, conversation_id: int, reader_id: int, read_at: datetime) -> None:
        """Отметить прочитанными сообщения собеседника. Коммит — вместе с перепиской."""

        await self.db.execute(
            update(Message)
            .where(
                Message.conversation_id == conversation_id,
                Message.sender_id != reader_id,
                Message.read_at.is_(None),
            )
            .values(read_at=read_at)
        )

    async def add(self, message: Message) -> Message:
        """Добавить сообщение. Коммит — вместе с перепиской."""

        self.db.add(message)
        await self.db.flush()
        await self.db.refresh(message)

        return message
