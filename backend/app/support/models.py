from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.uploads import media_url
from app.users.models import User

MAX_SUPPORT_TEXT = 2000
MAX_SUPPORT_PHOTOS = 5
MAX_PREVIEW = 200


class SupportThread(Base):
    """Переписка посетителя с поддержкой. Одна на посетителя: вошедший — по id, гость — по cookie."""

    __tablename__ = "support_threads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    visitor: Mapped[str] = mapped_column(String(64), unique=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    unread_for_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    unread_admin_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    unread_for_visitor: Mapped[int] = mapped_column(Integer, default=0)
    preview: Mapped[str] = mapped_column(String(MAX_PREVIEW), default="")

    last_message_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped[User | None] = relationship(lazy="joined")


class SupportMessage(Base):
    """Сообщение в поддержке: от посетителя или от администратора, текст и фото."""

    __tablename__ = "support_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    thread_id: Mapped[int] = mapped_column(
        ForeignKey("support_threads.id", ondelete="CASCADE"), index=True
    )
    from_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    text: Mapped[str] = mapped_column(Text, default="")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    photos: Mapped[list["SupportPhoto"]] = relationship(
        lazy="selectin", order_by="SupportPhoto.id", cascade="all, delete-orphan"
    )


class SupportPhoto(Base):
    """Фото, приложенное к сообщению в поддержке."""

    __tablename__ = "support_photos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    message_id: Mapped[int] = mapped_column(
        ForeignKey("support_messages.id", ondelete="CASCADE"), index=True
    )
    path: Mapped[str] = mapped_column(String(500))

    @property
    def url(self) -> str | None:
        """Адрес фото для сайта."""

        return media_url(self.path)
