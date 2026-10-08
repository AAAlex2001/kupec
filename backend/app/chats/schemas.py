from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.chats.models import MAX_MESSAGE_LENGTH, Conversation
from app.listings.models import ListingStatus


class ConversationStartSchema(BaseModel):
    """По какому объявлению написать."""

    listing_id: int = Field(..., description="ID объявления")


class MessageCreateSchema(BaseModel):
    """Новое сообщение."""

    text: str = Field(..., max_length=MAX_MESSAGE_LENGTH, description="Текст сообщения")


class MessageSchema(BaseModel):
    """Сообщение в переписке."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID сообщения")
    sender_id: int = Field(..., description="Кто отправил")
    text: str = Field(..., description="Текст")
    created_at: datetime = Field(..., description="Когда отправлено")
    read_at: datetime | None = Field(None, description="Когда прочитано собеседником")


class CompanionSchema(BaseModel):
    """Собеседник."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID пользователя")
    name: str | None = Field(None, description="Имя")
    avatar_url: str | None = Field(None, description="Адрес аватара")


class ConversationListingSchema(BaseModel):
    """Объявление, по которому переписка."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID объявления")
    title: str = Field(..., description="Название")
    status: ListingStatus = Field(..., description="Состояние объявления")
    price: Decimal | None = Field(None, description="Цена в рублях")
    unit_label: str | None = Field(None, description="Единица цены по-русски")
    cover_url: str | None = Field(None, description="Адрес обложки")


class ConversationSchema(BaseModel):
    """Переписка глазами пользователя: собеседник, объявление, последнее сообщение."""

    id: int = Field(..., description="ID переписки")
    listing: ConversationListingSchema
    companion: CompanionSchema
    last_message_text: str | None = Field(None, description="Текст последнего сообщения")
    last_message_at: datetime | None = Field(None, description="Когда написали последним")
    unread_count: int = Field(..., description="Сколько сообщений не прочитано")
    created_at: datetime = Field(..., description="Когда начата")

    @classmethod
    def for_user(cls, conversation: Conversation, user_id: int) -> "ConversationSchema":
        """Переписка с собеседником и непрочитанными этого пользователя."""

        return cls(
            id=conversation.id,
            listing=ConversationListingSchema.model_validate(conversation.listing),
            companion=CompanionSchema.model_validate(conversation.companion(user_id)),
            last_message_text=conversation.last_message_text,
            last_message_at=conversation.last_message_at,
            unread_count=conversation.unread_for(user_id),
            created_at=conversation.created_at,
        )


class ConversationDetailSchema(BaseModel):
    """Открытая переписка со всеми сообщениями."""

    conversation: ConversationSchema
    messages: list[MessageSchema]
    blocked_by_me: bool = Field(..., description="Я заблокировал собеседника")
    blocked_me: bool = Field(..., description="Собеседник заблокировал меня")


class UnreadSchema(BaseModel):
    """Сколько всего непрочитанных сообщений."""

    count: int = Field(..., description="Непрочитанных во всех переписках")
