from datetime import datetime
from enum import StrEnum

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.uploads import media_url
from app.listings.models import Listing
from app.users.models import User

MAX_REVIEW_PHOTOS = 10
MAX_REVIEW_LENGTH = 2000
ANONYMOUS_NAME = "Покупатель"

PUBLISHED_ONLY = text("status = 'published'")


class ReviewStatus(StrEnum):
    """Состояние отзыва. Продавцу и покупателям виден только опубликованный."""

    PENDING = "pending"
    PUBLISHED = "published"
    REJECTED = "rejected"


class Review(Base):
    """Отзыв покупателя о продавце по объявлению. На пару объявление–автор один отзыв.

    Если объявление удалят, отзыв останется у продавца без ссылки на объявление.
    """

    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    listing_id: Mapped[int | None] = mapped_column(
        ForeignKey("listings.id", ondelete="SET NULL"), index=True
    )
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    rating: Mapped[int] = mapped_column(Integer)
    text: Mapped[str | None] = mapped_column(Text)
    anonymous: Mapped[bool] = mapped_column(Boolean, default=False)

    status: Mapped[str] = mapped_column(String(16), default=ReviewStatus.PENDING)
    reject_reason: Mapped[str | None] = mapped_column(String(300))

    reply_text: Mapped[str | None] = mapped_column(Text)
    reply_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    listing: Mapped[Listing | None] = relationship(lazy="joined")
    author: Mapped[User] = relationship(foreign_keys=[author_id], lazy="joined")
    seller: Mapped[User] = relationship(foreign_keys=[seller_id], lazy="joined")
    photos: Mapped[list["ReviewPhoto"]] = relationship(
        back_populates="review",
        lazy="selectin",
        order_by="ReviewPhoto.sort_order, ReviewPhoto.id",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        UniqueConstraint("listing_id", "author_id"),
        CheckConstraint("rating BETWEEN 1 AND 5", name="ck_reviews_rating"),
        CheckConstraint(
            "status IN ('pending', 'published', 'rejected')", name="ck_reviews_status"
        ),
        Index(
            "ix_reviews_seller_published",
            seller_id,
            created_at.desc(),
            id.desc(),
            postgresql_where=PUBLISHED_ONLY,
        ),
        Index("ix_reviews_status_updated", status, updated_at, id),
    )

    @property
    def author_name(self) -> str:
        """Как подписать автора: имя, а при анонимном отзыве — «Покупатель»."""

        if self.anonymous:
            return ANONYMOUS_NAME

        return self.author.name or ANONYMOUS_NAME


class ReviewPhoto(Base):
    """Фото к отзыву. Загружается до отправки, к отзыву привязывается при сохранении."""

    __tablename__ = "review_photos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    review_id: Mapped[int | None] = mapped_column(
        ForeignKey("reviews.id", ondelete="CASCADE"), index=True
    )

    path: Mapped[str] = mapped_column(String(500))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    review: Mapped[Review | None] = relationship(back_populates="photos")

    @property
    def url(self) -> str | None:
        """Адрес фото для сайта."""

        return media_url(self.path)
