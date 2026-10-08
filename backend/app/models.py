"""Все модели приложения в одном месте, чтобы их видели Alembic и SQLAlchemy."""

from app.auth.models import AuthCode, Session
from app.catalog.models import Category
from app.cities.models import City
from app.chats.models import Conversation, Message, UserBlock
from app.core.database import Base
from app.favorites.models import Favorite
from app.listings.models import Listing, ListingPhoto, ListingView
from app.users.models import User

__all__ = [
    "Base",
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
    "User",
]
