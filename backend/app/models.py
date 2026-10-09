"""Все модели приложения в одном месте, чтобы их видели Alembic и SQLAlchemy."""

from app.attributes.models import Attribute, AttributeOption, CategoryAttribute
from app.auth.models import AuthCode, Session
from app.catalog.models import Category
from app.cities.models import City
from app.chats.models import Conversation, Message, UserBlock
from app.core.database import Base
from app.favorites.models import Favorite
from app.listings.models import Listing, ListingPhoto, ListingView
from app.reviews.models import Review, ReviewPhoto
from app.units.models import Unit
from app.users.models import User

__all__ = [
    "Base",
    "Attribute",
    "AttributeOption",
    "CategoryAttribute",
    "AuthCode",
    "Session",
    "Category",
    "City",
    "Conversation",
    "Message",
    "UserBlock",
    "Favorite",
    "Listing",
    "ListingPhoto",
    "ListingView",
    "Review",
    "ReviewPhoto",
    "Unit",
    "User",
]
