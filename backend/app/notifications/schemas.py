from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.notifications.models import NotificationKind


class NotificationActorSchema(BaseModel):
    """Кто сделал действие."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID пользователя")
    name: str | None = Field(None, description="Имя")
    avatar_url: str | None = Field(None, description="Аватар")


class NotificationSchema(BaseModel):
    """Уведомление."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID уведомления")
    kind: NotificationKind = Field(..., description="Комментарий, ответ, лайк, репост или подписка")
    actor: NotificationActorSchema = Field(..., description="Кто")
    post_id: int | None = Field(None, description="К какому посту")
    article_path: str | None = Field(None, description="К какой статье: /news/slug или /blog/slug")
    read: bool = Field(..., description="Прочитано")
    created_at: datetime = Field(..., description="Когда")


class NotificationPageSchema(BaseModel):
    """Страница уведомлений и сколько их всего."""

    items: list[NotificationSchema]
    total: int = Field(..., description="Сколько уведомлений всего")


class UnreadSchema(BaseModel):
    """Сколько непрочитанных уведомлений."""

    count: int = Field(..., description="Непрочитанных")
