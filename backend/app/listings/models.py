from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.catalog.models import Category, ListingKind
from app.cities.models import City
from app.core.database import Base
from app.core.uploads import image_url
from app.users.models import User

MAX_PHOTOS = 10


class ListingStatus(StrEnum):
    """Состояние объявления. Покупатели видят только опубликованные."""

    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class Unit(StrEnum):
    """За что указана цена."""

    PIECE = "piece"
    KILOGRAM = "kg"
    JAR = "jar"
    LITER = "liter"
    PACK = "pack"
    HOUR = "hour"
    SESSION = "session"
    SERVICE = "service"
    DAY = "day"


UNIT_LABELS = {
    Unit.PIECE: "штука",
    Unit.KILOGRAM: "кг",
    Unit.JAR: "банка",
    Unit.LITER: "литр",
    Unit.PACK: "упаковка",
    Unit.HOUR: "час",
    Unit.SESSION: "сеанс",
    Unit.SERVICE: "услуга",
    Unit.DAY: "день",
}

UNITS_BY_KIND = {
    ListingKind.PRODUCT: (Unit.PIECE, Unit.KILOGRAM, Unit.JAR, Unit.LITER, Unit.PACK),
    ListingKind.SERVICE: (Unit.HOUR, Unit.SESSION, Unit.SERVICE, Unit.DAY),
}


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

    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    kind: Mapped[str] = mapped_column(String(16))
    status: Mapped[str] = mapped_column(String(16), default=ListingStatus.DRAFT, index=True)

    category_id: Mapped[int | None] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"), index=True
    )
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text)

    price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    unit: Mapped[str | None] = mapped_column(String(16))

    city_id: Mapped[int | None] = mapped_column(
        ForeignKey("cities.id", ondelete="SET NULL"), index=True
    )
    address: Mapped[str | None] = mapped_column(String(300))
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    service_places: Mapped[list[str]] = mapped_column(JSONB, default=list)
    schedule: Mapped[str | None] = mapped_column(String(200))
    contact_phone: Mapped[str | None] = mapped_column(String(32))

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
    )

    @property
    def unit_label(self) -> str | None:
        """Единица цены по-русски: «банка», «сеанс»."""

        return UNIT_LABELS.get(self.unit) if self.unit else None

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

        return image_url(self.path)
