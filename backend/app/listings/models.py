from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.catalog.models import Category
from app.cities.models import City
from app.core.database import Base
from app.core.uploads import media_url
from app.units.models import Unit
from app.users.models import User

MAX_PHOTOS = 10

SEARCH_DOCUMENT = (
    "to_tsvector('russian'::regconfig, "
    "(COALESCE(title, ''::character varying)::text || ' '::text) || COALESCE(description, ''::text))"
)


class ListingStatus(StrEnum):
    """Состояние объявления. Покупатели видят только опубликованные."""

    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ServicePlace(StrEnum):
    """Где оказывают услугу."""

    SPECIALIST = "specialist"
    CLIENT = "client"
    ONLINE = "online"


SERVICE_PLACE_LABELS = {
    ServicePlace.SPECIALIST: "У специалиста",
    ServicePlace.CLIENT: "Выезд к клиенту",
    ServicePlace.ONLINE: "Онлайн",
}


class Listing(Base):
    """Объявление о товаре или услуге. Черновик можно сохранить незаполненным."""

    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    kind: Mapped[str] = mapped_column(String(16))
    status: Mapped[str] = mapped_column(String(16), default=ListingStatus.DRAFT)

    category_id: Mapped[int | None] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"), index=True
    )
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text)

    price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    unit: Mapped[str | None] = mapped_column(
        ForeignKey("units.code", ondelete="RESTRICT"), index=True
    )

    city_id: Mapped[int | None] = mapped_column(
        ForeignKey("cities.id", ondelete="SET NULL"), index=True
    )
    address: Mapped[str | None] = mapped_column(String(300))
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    service_places: Mapped[list[str]] = mapped_column(JSONB, default=list)
    schedule: Mapped[str | None] = mapped_column(String(200))
    contact_phone: Mapped[str | None] = mapped_column(String(32))
    attributes: Mapped[dict] = mapped_column(JSONB, default=dict)

    views_count: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    owner: Mapped[User] = relationship(lazy="joined")
    category: Mapped[Category | None] = relationship(lazy="joined")
    city: Mapped[City | None] = relationship(lazy="joined")
    price_unit: Mapped[Unit | None] = relationship(lazy="joined")
    photos: Mapped[list["ListingPhoto"]] = relationship(
        back_populates="listing",
        lazy="selectin",
        order_by="ListingPhoto.sort_order, ListingPhoto.id",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint("kind IN ('product', 'service')", name="ck_listings_kind"),
        CheckConstraint(
            "status IN ('draft', 'published', 'archived')", name="ck_listings_status"
        ),
        CheckConstraint("price IS NULL OR price >= 0", name="ck_listings_price"),
        Index(
            "ix_listings_feed",
            published_at.desc(),
            id.desc(),
            postgresql_where=text("status = 'published'"),
        ),
        Index(
            "ix_listings_category_feed",
            category_id,
            published_at.desc(),
            id.desc(),
            postgresql_where=text("status = 'published'"),
        ),
        Index(
            "ix_listings_city_feed",
            city_id,
            published_at.desc(),
            id.desc(),
            postgresql_where=text("status = 'published'"),
        ),
        Index("ix_listings_owner_updated", owner_id, status, updated_at.desc(), id.desc()),
        Index("ix_listings_status_updated", status, updated_at.desc(), id.desc()),
        Index("ix_listings_price", "price"),
        Index(
            "ix_listings_attributes",
            "attributes",
            postgresql_using="gin",
            postgresql_ops={"attributes": "jsonb_path_ops"},
        ),
        Index(
            "ix_listings_title_trgm",
            "title",
            postgresql_using="gin",
            postgresql_ops={"title": "gin_trgm_ops"},
        ),
        Index("ix_listings_search", text(SEARCH_DOCUMENT), postgresql_using="gin"),
    )

    @property
    def unit_label(self) -> str | None:
        """Единица цены по-русски: «банка», «сеанс»."""

        return self.price_unit.label if self.price_unit else None

    @property
    def service_place_labels(self) -> list[str]:
        """Места проведения услуги по-русски: «У специалиста», «Онлайн»."""

        return [SERVICE_PLACE_LABELS[place] for place in self.service_places]

    @property
    def cover_url(self) -> str | None:
        """Адрес первого фото — обложки объявления."""

        return self.photos[0].url if self.photos else None


class ListingView(Base):
    """Просмотр объявления посетителем за день. Один посетитель — один просмотр в сутки."""

    __tablename__ = "listing_views"

    listing_id: Mapped[int] = mapped_column(
        ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True
    )
    visitor: Mapped[str] = mapped_column(String(64), primary_key=True)
    viewed_on: Mapped[date] = mapped_column(Date, primary_key=True)


class ListingPhoto(Base):
    """Фото объявления. Загружается до публикации, к объявлению привязывается при сохранении."""

    __tablename__ = "listing_photos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    listing_id: Mapped[int | None] = mapped_column(
        ForeignKey("listings.id", ondelete="CASCADE"), index=True
    )

    path: Mapped[str] = mapped_column(String(500))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    listing: Mapped[Listing | None] = relationship(back_populates="photos")

    @property
    def url(self) -> str | None:
        """Адрес фото для сайта."""

        return media_url(self.path)
