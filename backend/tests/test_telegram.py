"""Кросспостинг в Telegram без сети и БД: разметка, обрезка, токен привязки, отправка и события бота."""

import asyncio

from app.core.config import get_settings
from app.posts.models import Post
from app.telegram.models import TelegramLink
from app.telegram.services.link_token import create_link_token, read_link_token
from app.telegram.services.markup import fit_text, html_blocks, join_blocks, text_size
from app.telegram.services.usecases.handle_update import HandleUpdateUseCase
from app.telegram.services.usecases.publish_post import PublishPostUseCase

CHANNEL_ID = -100500
TELEGRAM_USER_ID = 777


class FakeClient:
    """Запоминает отправленные сообщения."""

    def __init__(self) -> None:
        self.texts: list[tuple[int, str]] = []

    async def send_text(self, chat_id: int, html: str) -> None:
        self.texts.append((chat_id, html))


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


def test_post_goes_to_linked_channel_only() -> None:
    client = FakeClient()
    post = Post(id=1, author_id=5, html="<p>Свежие <strong>огурцы</strong></p>", media=[], listings=[])
    link = TelegramLink(user_id=5, telegram_user_id=TELEGRAM_USER_ID, channel_id=CHANNEL_ID)

    asyncio.run(PublishPostUseCase(FakeLinks(link), client, get_settings()).execute(post))
    asyncio.run(PublishPostUseCase(FakeLinks(None), client, get_settings()).execute(post))

    assert client.texts == [(CHANNEL_ID, "Свежие <b>огурцы</b>")]


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
