from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.cities.models import City
from app.core.database import Base
from app.core.uploads import media_url


class User(Base):
    """Пользователь площадки. Один аккаунт и покупает, и размещает объявления."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    email: Mapped[str] = mapped_column(String(254), unique=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    password_hash: Mapped[str | None] = mapped_column(String(255))
    failed_logins: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    name: Mapped[str | None] = mapped_column(String(100))
    phone: Mapped[str | None] = mapped_column(String(32))
    avatar_path: Mapped[str | None] = mapped_column(String(500))

    city_id: Mapped[int | None] = mapped_column(
        ForeignKey("cities.id", ondelete="SET NULL"), index=True
    )

    notify_messages_email: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_site: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_news_email: Mapped[bool] = mapped_column(Boolean, default=False)

    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    rating: Mapped[float] = mapped_column(Float, default=0)
    reviews_count: Mapped[int] = mapped_column(Integer, default=0)
    following_seen_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    city: Mapped[City | None] = relationship(lazy="joined")

    @property
    def avatar_url(self) -> str | None:
        """Адрес аватара для сайта."""

        return media_url(self.avatar_path)
