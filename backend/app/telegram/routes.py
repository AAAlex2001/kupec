from fastapi import APIRouter, Depends, status

from app.auth.dependencies import require_user
from app.core.config import get_settings
from app.telegram.dependencies import get_link_repository
from app.telegram.schemas import TelegramLinkSchema
from app.telegram.services.link_token import create_link_token
from app.telegram.services.repo import TelegramLinkRepository
from app.users.models import User

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
