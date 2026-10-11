import hmac
import logging

from fastapi import APIRouter, Body, Depends, Header, HTTPException, status

from app.auth.dependencies import require_user
from app.core.config import get_settings
from app.core.telegram import TelegramError
from app.telegram.dependencies import get_handle_update_usecase, get_link_repository
from app.telegram.schemas import TelegramLinkSchema
from app.telegram.services.link_token import create_link_token
from app.telegram.services.repo import TelegramLinkRepository
from app.telegram.services.usecases.handle_update import HandleUpdateUseCase
from app.users.models import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/telegram", tags=["telegram"])


@router.get("/link")
async def get_link(
    user: User = Depends(require_user),
    links: TelegramLinkRepository = Depends(get_link_repository),
) -> TelegramLinkSchema:
    """Подключён ли Telegram и канал, и ссылка на бота для подключения."""

    settings = get_settings()
    bot = settings.telegram_bot_username
    if not settings.telegram_bot_token or not bot:
        return TelegramLinkSchema(enabled=False)

    link = await links.get_by_user(user.id)

    return TelegramLinkSchema(
        enabled=True,
        connect_url=f"https://t.me/{bot}?start={create_link_token(user.id)}",
        bot_username=bot,
        linked=link is not None,
        channel_title=link.channel_title if link else None,
    )


@router.delete("/link", status_code=status.HTTP_204_NO_CONTENT)
async def delete_link(
    user: User = Depends(require_user),
    links: TelegramLinkRepository = Depends(get_link_repository),
) -> None:
    """Отключить Telegram: посты больше не уходят в канал."""

    await links.delete(user.id)


@router.post("/webhook")
async def webhook(
    update: dict = Body(...),
    secret: str = Header("", alias="X-Telegram-Bot-Api-Secret-Token"),
    usecase: HandleUpdateUseCase = Depends(get_handle_update_usecase),
) -> dict[str, bool]:
    """События бота от Telegram. Принимаются только с секретом, заданным при setWebhook."""

    expected = get_settings().telegram_webhook_secret
    if not expected or not hmac.compare_digest(secret, expected):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Неверный секрет")

    try:
        await usecase.execute(update)
    except TelegramError as error:
        logger.warning("Бот не ответил в Telegram: %s", error)

    return {"ok": True}
