from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.listings.models import Listing
from app.users.models import User

MAX_MESSAGE_LENGTH = 2000


class Conversation(Base):
    """Переписка покупателя с автором объявления. На пару объявление–покупатель одна.

    Последнее сообщение и непрочитанные хранятся здесь, чтобы список диалогов читался одним запросом.
    """

    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    listing_id: Mapped[int] = mapped_column(
        ForeignKey("listings.id", ondelete="CASCADE"), index=True
    )
    buyer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    last_message_text: Mapped[str | None] = mapped_column(Text)
    last_message_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    buyer_unread: Mapped[int] = mapped_column(Integer, default=0)
    seller_unread: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    listing: Mapped[Listing] = relationship(lazy="joined")
    buyer: Mapped[User] = relationship(foreign_keys=[buyer_id], lazy="joined")
    seller: Mapped[User] = relationship(foreign_keys=[seller_id], lazy="joined")

    __table_args__ = (UniqueConstraint("listing_id", "buyer_id"),)

    def companion(self, user_id: int) -> User:
        """Собеседник пользователя в этой переписке."""

        return self.seller if user_id == self.buyer_id else self.buyer

    def unread_for(self, user_id: int) -> int:
        """Сколько сообщений пользователь ещё не прочитал."""

        return self.buyer_unread if user_id == self.buyer_id else self.seller_unread


class UserBlock(Base):
    """Пользователь заблокировал другого: тот больше не может ему писать."""

    __tablename__ = "user_blocks"

    blocker_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    blocked_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True, index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Message(Base):
    """Сообщение в переписке."""

    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    conversation_id: Mapped[int] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE")
    )
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    text: Mapped[str] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        Index("ix_messages_conversation_feed", conversation_id, created_at, id),
    )
