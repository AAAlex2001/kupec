from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.cities.schemas import CitySchema


class UserUpdateSchema(BaseModel):
    """Изменение профиля. Передаются только поля, которые меняются."""

    name: str = Field(None, min_length=1, max_length=100, description="Как обращаться")
    phone: str | None = Field(None, max_length=32, description="Телефон. null — удалить")
    city_id: int | None = Field(None, description="Город. null — не указан")
    notify_messages_email: bool = Field(None, description="Новые сообщения на почту")
    notify_site: bool = Field(None, description="Уведомления на сайте")
    notify_news_email: bool = Field(None, description="Новости площадки на почту")


class UserSchema(BaseModel):
    """Пользователь, под которым выполнен вход."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID пользователя")
    email: str = Field(..., description="Email, он же логин")
    name: str | None = Field(None, description="Имя. Пусто сразу после первого входа")
    phone: str | None = Field(None, description="Телефон")
    avatar_url: str | None = Field(None, description="Аватар")
    city: CitySchema | None = Field(None, description="Город")
    notify_messages_email: bool = Field(..., description="Новые сообщения на почту")
    notify_site: bool = Field(..., description="Уведомления на сайте")
    notify_news_email: bool = Field(..., description="Новости площадки на почту")
    is_admin: bool = Field(..., description="Администратор площадки")
    created_at: datetime = Field(..., description="Когда зарегистрирован")
