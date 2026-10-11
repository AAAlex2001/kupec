from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SupportPhotoSchema(BaseModel):
    """Фото в сообщении поддержки."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID")
    url: str = Field(..., description="Адрес фото")


class SupportMessageSchema(BaseModel):
    """Сообщение в поддержке."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID")
    from_admin: bool = Field(..., description="Ответ поддержки, а не посетителя")
    text: str = Field(..., description="Текст")
    photos: list[SupportPhotoSchema] = Field([], description="Фото")
    created_at: datetime = Field(..., description="Когда отправлено")


class SupportPersonSchema(BaseModel):
    """Кто пишет в поддержку, если это вошедший пользователь."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID пользователя")
    name: str | None = Field(None, description="Имя")
    email: str = Field(..., description="Почта")


class SupportThreadSchema(BaseModel):
    """Переписка с поддержкой для посетителя."""

    messages: list[SupportMessageSchema] = Field([], description="Сообщения по порядку")


class SupportUnreadSchema(BaseModel):
    """Сколько ответов поддержки посетитель ещё не видел."""

    count: int = Field(0, description="Ответы поддержки с тех пор, как посетитель открывал чат")


class AdminSupportThreadSchema(BaseModel):
    """Обращение в списке админки: кто, последнее сообщение и есть ли непрочитанное."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID")
    user: SupportPersonSchema | None = Field(None, description="Пользователь. Нет — гость")
    preview: str = Field(..., description="Начало последнего сообщения")
    unread_for_admin: bool = Field(..., description="Есть сообщение без ответа")
    last_message_at: datetime = Field(..., description="Когда было последнее сообщение")


class AdminSupportPageSchema(BaseModel):
    """Страница обращений и сколько непрочитанных."""

    items: list[AdminSupportThreadSchema]
    total: int
    unread: int


class AdminSupportDetailSchema(BaseModel):
    """Обращение целиком для админки."""

    thread: AdminSupportThreadSchema
    messages: list[SupportMessageSchema]
