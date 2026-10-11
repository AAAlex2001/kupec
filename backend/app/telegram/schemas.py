from pydantic import BaseModel, Field


class TelegramLinkSchema(BaseModel):
    """Подключение Telegram в настройках: включён ли кросспостинг, ссылка на бота и канал."""

    enabled: bool = Field(..., description="Бот настроен на сервере")
    connect_url: str | None = Field(None, description="Ссылка t.me на бота с токеном привязки на час")
    bot_username: str | None = Field(None, description="Имя бота без @")
    linked: bool = Field(False, description="Аккаунт Telegram привязан")
    channel_title: str | None = Field(None, description="Подключённый канал")
