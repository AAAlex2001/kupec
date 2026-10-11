from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

MEDIA_URL = "/media"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")

    database_url: str
    db_pool_size: int = Field(20, ge=1, description="Постоянных соединений с БД на процесс")
    db_max_overflow: int = Field(10, ge=0, description="Сколько ещё можно открыть при всплеске")
    cors_origins: list[str] = []
    debug: bool = False

    media_dir: str = "media"
    cookie_secure: bool = True

    code_secret: str = Field(min_length=32, description="Секрет для хешей кодов из писем")
    code_expires_minutes: int = 10
    code_max_attempts: int = 5
    code_resend_seconds: int = 60
    codes_per_hour: int = 5

    login_max_attempts: int = 5
    login_lock_minutes: int = 15

    session_expires_days: int = 30

    smtp_host: str = Field("", description="Пусто — письма пишутся в лог вместо отправки")
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "Купец <no-reply@kupec.local>"

    proxyapi_key: str = Field("", description="Ключ ProxyAPI. Пусто — ИИ-помощник выключен")
    ai_base_url: str = "https://api.proxyapi.ru/v1"
    ai_model: str = "deepseek/deepseek-v3.2"
    ai_requests_per_hour: int = Field(30, ge=1, description="Запросов к ИИ на человека в час")

    telegram_bot_token: str = Field("", description="Токен бота из BotFather. Пусто — кросспостинг выключен")
    telegram_bot_username: str = Field("", description="Имя бота без @ для ссылки t.me/<имя>")
    telegram_webhook_secret: str = Field("", description="Секрет, которым Telegram подписывает webhook")

    indexnow_key: str = Field(
        "4bdf9933a4d2d0f9511613b9188be059",
        description="Ключ IndexNow. Публичный: тот же лежит файлом /<ключ>.txt на сайте",
    )

    site_url: str = Field(
        "http://localhost:3000",
        validation_alias="NEXT_PUBLIC_SITE_URL",
        description="Адрес сайта для ссылок и логотипа в письмах",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
