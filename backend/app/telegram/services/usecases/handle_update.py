"""Сценарий событий бота: привязка аккаунта по ссылке с сайта и подключение канала."""

from html import escape

from app.core.config import Settings
from app.core.telegram import TelegramClient
from app.telegram.models import MAX_CHANNEL_TITLE
from app.telegram.services.link_token import read_link_token
from app.telegram.services.repo import TelegramLinkRepository

START_HINT = (
    "Это бот сайта «Купец». Чтобы публиковать посты в свой канал, откройте на сайте "
    "Профиль → Настройки и нажмите «Подключить Telegram»."
)
LINKED_TEXT = (
    "Аккаунт привязан к «Купцу» ✅\n\n"
    "Теперь добавьте @{bot} администратором в свой канал с правами публиковать, "
    "редактировать и удалять сообщения. Если бот уже там — уберите его и добавьте снова."
)
CHANNEL_LINKED_TEXT = "Канал «{title}» подключён ✅ Включайте «Опубликовать в Telegram» при публикации поста."
NO_RIGHTS_TEXT = "Боту в канале «{title}» не хватает права публиковать сообщения. Дайте его в настройках администраторов."


class HandleUpdateUseCase:
    """Разобрать событие от Telegram. Остальные события бот пропускает."""

    def __init__(self, links: TelegramLinkRepository, client: TelegramClient, settings: Settings) -> None:
        self.links = links
        self.client = client
        self.settings = settings

    async def execute(self, update: dict) -> None:
        """Сообщение боту или смена прав бота в канале."""

        message = update.get("message")
        if message:
            await self.on_message(message)

        member = update.get("my_chat_member")
        if member:
            await self.on_channel(member)

    async def on_message(self, message: dict) -> None:
        """/start с токеном с сайта — привязать аккаунт. Иначе — подсказать, где подключиться."""

        chat = message.get("chat") or {}
        sender = message.get("from") or {}
        text = message.get("text") or ""
        if chat.get("type") != "private" or not text.startswith("/start") or "id" not in sender:
            return

        parts = text.split(maxsplit=1)
        user_id = read_link_token(parts[1]) if len(parts) == 2 else None
        if user_id is None:
            await self.client.send_text(chat["id"], escape(START_HINT, quote=False))
            return

        await self.links.link_account(user_id, sender["id"])
        reply = LINKED_TEXT.format(bot=self.settings.telegram_bot_username)
        await self.client.send_text(chat["id"], escape(reply, quote=False))

    async def on_channel(self, member: dict) -> None:
        """Бота сделали администратором канала — привязать канал тому, кто добавил. Убрали — отвязать."""

        chat = member.get("chat") or {}
        sender = member.get("from") or {}
        rights = member.get("new_chat_member") or {}
        if chat.get("type") != "channel" or "id" not in chat:
            return

        if rights.get("status") != "administrator":
            await self.links.clear_channel(chat["id"])
            return

        link = await self.links.get_by_telegram_user(sender.get("id", 0))
        if link is None:
            return

        title = (chat.get("title") or "Канал")[:MAX_CHANNEL_TITLE]
        if not rights.get("can_post_messages"):
            await self.client.send_text(link.telegram_user_id, escape(NO_RIGHTS_TEXT.format(title=title), quote=False))
            return

        await self.links.set_channel(link, chat["id"], title)
        await self.client.send_text(link.telegram_user_id, escape(CHANNEL_LINKED_TEXT.format(title=title), quote=False))
