"""Кросспостинг в Telegram без сети и БД: разметка, обрезка, токен привязки, отправка и события бота."""

import asyncio
import pytest

from app.core.config import get_settings
from app.posts.models import Post
from app.telegram.models import TelegramLink
from app.telegram.services.link_token import create_link_token, read_link_token
from app.telegram.services.markup import fit_text, html_blocks, join_blocks, text_size
from app.telegram.services.message import message_url
from app.telegram.services.usecases.handle_update import HandleUpdateUseCase
from app.telegram.services.usecases.publish_post import PublishPostUseCase

CHANNEL_ID = -100500
TELEGRAM_USER_ID = 777


class FakeClient:
    """Запоминает отправленные сообщения. Канал публичный — @ogorod."""

    def __init__(self) -> None:
        self.texts: list[tuple[int, str]] = []

    async def send_text(self, chat_id: int, html: str) -> dict:
        self.texts.append((chat_id, html))
        return {"message_id": len(self.texts), "chat": {"id": chat_id, "username": "ogorod"}}


class FakePosts:
    """Запоминает ссылку на пост в канале."""

    def __init__(self) -> None:
        self.telegram_url: str | None = None

    async def set_telegram_url(self, post_id: int, url: str | None) -> None:
        self.telegram_url = url


class FakeLinks:
    """Одна привязка в памяти."""

    def __init__(self, link: TelegramLink | None = None) -> None:
        self.link = link

    async def get_by_user(self, user_id: int) -> TelegramLink | None:
        return self.link

    async def get_by_telegram_user(self, telegram_user_id: int) -> TelegramLink | None:
        return self.link

    async def link_account(self, user_id: int, telegram_user_id: int) -> None:
        self.link = TelegramLink(user_id=user_id, telegram_user_id=telegram_user_id)

    async def set_channel(self, link: TelegramLink, channel_id: int, title: str) -> None:
        link.channel_id = channel_id
        link.channel_title = title

    async def clear_channel(self, channel_id: int) -> None:
        if self.link is not None and self.link.channel_id == channel_id:
            self.link.channel_id = None

    async def migrate_chat(self, old_id: int, new_id: int) -> None:
        if self.link is not None and self.link.channel_id == old_id:
            self.link.channel_id = new_id


def test_editor_html_becomes_telegram_markup() -> None:
    html = (
        "<h2>Итоги <strong>недели</strong></h2>"
        '<p>Привет 👋 <strong>мир</strong> &amp; <em>курсив</em> <a href="https://ya.ru?a=1&amp;b=2">ссылка</a></p>'
        "<ul><li><p>раз</p></li><li><p>два</p></li></ul>"
        "<ol><li><p>первый</p></li></ol>"
        "<blockquote><p>цитата</p><p>вторая строка</p></blockquote>"
    )

    result = join_blocks(html_blocks(html)).html

    assert result == (
        "<b>Итоги недели</b>\n\n"
        'Привет 👋 <b>мир</b> &amp; <i>курсив</i> <a href="https://ya.ru?a=1&amp;b=2">ссылка</a>\n\n'
        "• раз\n• два\n"
        "1. первый\n\n"
        "<blockquote>цитата\nвторая строка</blockquote>"
    )


def test_long_text_is_cut_by_blocks_with_link_to_site() -> None:
    blocks = html_blocks("<p>Первый абзац 😀</p>" + "<p>" + "слово " * 200 + "</p>")

    result = fit_text(blocks, 100, "https://kupec.ru/posts/1")

    assert result.startswith("Первый абзац 😀")
    assert result.endswith('<a href="https://kupec.ru/posts/1">Читать полностью на Купце</a>')
    assert "слово" not in result


def test_one_huge_paragraph_is_cut_to_limit() -> None:
    blocks = html_blocks("<p>" + "😀" * 3000 + "</p>")

    result = fit_text(blocks, 1024, "https://kupec.ru/posts/1")

    assert text_size(result.split("\n\n")[0]) <= 1024


def test_link_token_is_signed() -> None:
    token = create_link_token(42)

    assert read_link_token(token) == 42
    assert read_link_token(token.replace("42-", "43-", 1)) is None
    assert read_link_token("мусор") is None


def test_post_goes_to_linked_channel_only_and_keeps_link() -> None:
    client = FakeClient()
    posts = FakePosts()
    post = Post(id=1, author_id=5, html="<p>Свежие <strong>огурцы</strong></p>", media=[], listings=[])
    link = TelegramLink(user_id=5, telegram_user_id=TELEGRAM_USER_ID, channel_id=CHANNEL_ID)

    asyncio.run(PublishPostUseCase(posts, FakeLinks(link), client, get_settings()).execute(post))
    asyncio.run(PublishPostUseCase(posts, FakeLinks(None), client, get_settings()).execute(post))

    assert client.texts == [(CHANNEL_ID, "Свежие <b>огурцы</b>")]
    assert posts.telegram_url == "https://t.me/ogorod/1"


def test_private_channel_link_uses_channel_id() -> None:
    message = {"message_id": 7, "chat": {"id": -1001234567890}}

    assert message_url(message) == "https://t.me/c/1234567890/7"


def test_start_links_account_and_admin_rights_link_channel() -> None:
    links = FakeLinks()
    client = FakeClient()
    usecase = HandleUpdateUseCase(links, client, get_settings())
    sender = {"id": TELEGRAM_USER_ID}

    start = {"chat": {"id": TELEGRAM_USER_ID, "type": "private"}, "from": sender, "text": f"/start {create_link_token(5)}"}
    asyncio.run(usecase.execute({"message": start}))
    channel = {"id": CHANNEL_ID, "type": "channel", "title": "Огород"}
    admin = {"status": "administrator", "can_post_messages": True}
    asyncio.run(usecase.execute({"my_chat_member": {"chat": channel, "from": sender, "new_chat_member": admin}}))

    assert links.link.user_id == 5
    assert links.link.channel_id == CHANNEL_ID

    removed = {"status": "left"}
    asyncio.run(usecase.execute({"my_chat_member": {"chat": channel, "from": sender, "new_chat_member": removed}}))

    assert links.link.channel_id is None


@pytest.mark.parametrize("chat_type", ["group", "supergroup"])
def test_group_admin_connects_without_channel_permissions(chat_type: str) -> None:
    link = TelegramLink(user_id=5, telegram_user_id=TELEGRAM_USER_ID)
    links = FakeLinks(link)
    client = FakeClient()
    chat = {"id": CHANNEL_ID, "type": chat_type, "title": "Соседи"}
    member = {"chat": chat, "from": {"id": TELEGRAM_USER_ID}, "new_chat_member": {"status": "administrator"}}
    usecase = HandleUpdateUseCase(links, client, get_settings())

    asyncio.run(usecase.execute({"my_chat_member": member}))

    assert link.channel_id == CHANNEL_ID
    assert link.channel_title == "Соседи"
    assert "подключено" in client.texts[0][1]

    member["new_chat_member"] = {"status": "member"}
    asyncio.run(usecase.execute({"my_chat_member": member}))

    assert link.channel_id is None


def test_channel_without_posting_right_clears_connection() -> None:
    link = TelegramLink(user_id=5, telegram_user_id=TELEGRAM_USER_ID, channel_id=CHANNEL_ID)
    client = FakeClient()
    member = {
        "chat": {"id": CHANNEL_ID, "type": "channel", "title": "Новости"},
        "from": {"id": TELEGRAM_USER_ID},
        "new_chat_member": {"status": "administrator", "can_post_messages": False},
    }

    asyncio.run(HandleUpdateUseCase(FakeLinks(link), client, get_settings()).execute({"my_chat_member": member}))

    assert link.channel_id is None
    assert "не хватает права" in client.texts[0][1]


def test_group_migration_keeps_connection() -> None:
    link = TelegramLink(user_id=5, telegram_user_id=TELEGRAM_USER_ID, channel_id=-123)
    usecase = HandleUpdateUseCase(FakeLinks(link), FakeClient(), get_settings())
    message = {"chat": {"id": -123, "type": "group"}, "migrate_to_chat_id": -100123}

    asyncio.run(usecase.execute({"message": message}))

    assert link.channel_id == -100123


def test_basic_group_does_not_generate_invalid_message_link() -> None:
    assert message_url({"message_id": 7, "chat": {"id": -123, "type": "group"}}) is None


def test_post_is_published_in_basic_group_without_message_link() -> None:
    class GroupClient(FakeClient):
        async def send_text(self, chat_id: int, html: str) -> dict:
            self.texts.append((chat_id, html))
            return {"message_id": 1, "chat": {"id": chat_id, "type": "group"}}

    client = GroupClient()
    posts = FakePosts()
    link = TelegramLink(user_id=5, telegram_user_id=TELEGRAM_USER_ID, channel_id=-123)
    post = Post(id=1, author_id=5, html="<p>Привет, соседи!</p>", media=[], listings=[])

    asyncio.run(PublishPostUseCase(posts, FakeLinks(link), client, get_settings()).execute(post))

    assert client.texts == [(-123, "Привет, соседи!")]
    assert posts.telegram_url is None
