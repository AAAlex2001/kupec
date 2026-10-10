"""Тесты ИИ-помощника постов без сети и БД."""

import asyncio
from datetime import datetime, timedelta, timezone

import pytest

from app.posts.services.exceptions import EmptyAiAnswerError, TooManyAiRequestsError
from app.posts.services.usecases.write_with_ai import WritePostWithAiUseCase, to_html
from app.users.models import User
from tests.fakes import make_settings

USER = User(id=1, email="anna@mail.ru")


class FakeAi:
    """Отвечает заранее заданным текстом и запоминает, что у него спросили."""

    def __init__(self, answer: str) -> None:
        self.answer = answer
        self.asked: list[str] = []

    async def complete(self, system: str, user: str, max_tokens: int) -> str:
        self.asked.append(user)
        return self.answer


class FakeAiRequests:
    """Запросы к ИИ в памяти."""

    def __init__(self, issued: list[datetime] | None = None) -> None:
        self.issued = issued or []

    async def list_since(self, user_id: int, since: datetime) -> list[datetime]:
        return [moment for moment in self.issued if moment >= since]

    async def add(self, user_id: int) -> None:
        self.issued.append(datetime.now(timezone.utc))


def write(answer: str, html: str = "", requests: FakeAiRequests | None = None) -> str:
    usecase = WritePostWithAiUseCase(FakeAi(answer), requests or FakeAiRequests(), make_settings())

    return asyncio.run(usecase.execute(USER, "Напиши пост про мёд", html))


def test_answer_keeps_only_editor_tags() -> None:
    html = write('<h2>Мёд</h2><p>Свежий <strong>липовый</strong></p><script>alert(1)</script>')

    assert html == "Мёд<p>Свежий <strong>липовый</strong></p>"


def test_code_fence_and_plain_text_become_paragraphs() -> None:
    assert to_html("```html\n<p>Привет</p>\n```") == "<p>Привет</p>"
    assert to_html("Первый абзац\nстрока\n\nВторой") == "<p>Первый абзац<br>строка</p><p>Второй</p>"


def test_empty_answer_is_an_error() -> None:
    with pytest.raises(EmptyAiAnswerError):
        write("<p> </p>")


def test_current_text_goes_to_the_model() -> None:
    ai = FakeAi("<p>Готово</p>")
    usecase = WritePostWithAiUseCase(ai, FakeAiRequests(), make_settings())

    asyncio.run(usecase.execute(USER, "Сократи", "<p>Длинный текст</p>"))

    assert "Сократи" in ai.asked[0] and "<p>Длинный текст</p>" in ai.asked[0]


def test_hourly_limit_stops_requests() -> None:
    now = datetime.now(timezone.utc)
    issued = [now - timedelta(minutes=50) + timedelta(seconds=index) for index in range(30)]

    with pytest.raises(TooManyAiRequestsError) as error:
        write("<p>Текст</p>", requests=FakeAiRequests(issued))

    assert 0 < error.value.retry_after <= 10 * 60 + 1
