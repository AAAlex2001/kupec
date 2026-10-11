from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

MAX_CHANNEL_TITLE = 255


class TelegramLink(Base):
    """Telegram пользователя сайта и его канал, куда бот публикует посты."""

    __tablename__ = "telegram_links"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    telegram_user_id: Mapped[int] = mapped_column(BigInteger, unique=True)
    channel_id: Mapped[int | None] = mapped_column(BigInteger, unique=True)
    channel_title: Mapped[str | None] = mapped_column(String(MAX_CHANNEL_TITLE))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
