"""Сообщения в поддержку: пустые и спам не проходят, непрочитанность у нужной стороны."""

import asyncio
from datetime import datetime

import pytest

from app.support.models import SupportMessage, SupportThread
from app.support.services.exceptions import (
    EmptySupportMessageError,
    TooManySupportMessagesError,
    TooManySupportPhotosError,
)
from app.support.services.usecases.send_message import MESSAGES_PER_MINUTE, SendSupportMessageUseCase


class FakeSupport:
    """Считает сообщения посетителя и запоминает сохранённые."""

    def __init__(self, recent: int = 0) -> None:
        self.recent = recent
        self.saved: list[SupportMessage] = []

    async def count_since(self, thread_id: int, since: datetime) -> int:
        return self.recent

    async def add_message(self, message: SupportMessage) -> SupportMessage:
        self.saved.append(message)
        return message


def make_thread() -> SupportThread:
    return SupportThread(id=1, visitor="guest:abc", unread_for_admin=False, unread_for_visitor=0)


def test_visitor_message_is_unread_for_admin_and_shows_preview() -> None:
    support = FakeSupport()
    thread = make_thread()

    asyncio.run(SendSupportMessageUseCase(support).execute(thread, "  Не приходит код  ", [], from_admin=False))

    assert support.saved[0].text == "Не приходит код"
    assert thread.unread_for_admin is True
    assert thread.unread_for_visitor == 0
    assert thread.preview == "Не приходит код"


def test_admin_replies_are_counted_for_visitor_until_visitor_writes() -> None:
    usecase = SendSupportMessageUseCase(FakeSupport())
    thread = make_thread()
    thread.unread_for_admin = True

    asyncio.run(usecase.execute(thread, "Проверьте «Спам»", [], from_admin=True))
    asyncio.run(usecase.execute(thread, "И папку «Промоакции»", [], from_admin=True))

    assert thread.unread_for_admin is False
    assert thread.unread_for_visitor == 2

    asyncio.run(usecase.execute(thread, "Нашёл, спасибо", [], from_admin=False))

    assert thread.unread_for_visitor == 0


def test_empty_message_and_too_many_photos_are_rejected() -> None:
    usecase = SendSupportMessageUseCase(FakeSupport())

    with pytest.raises(EmptySupportMessageError):
        asyncio.run(usecase.execute(make_thread(), "   ", [], from_admin=False))
    with pytest.raises(TooManySupportPhotosError):
        asyncio.run(usecase.execute(make_thread(), "", [object()] * 6, from_admin=False))


def test_visitor_spam_is_limited_but_admin_is_not() -> None:
    usecase = SendSupportMessageUseCase(FakeSupport(recent=MESSAGES_PER_MINUTE))

    with pytest.raises(TooManySupportMessagesError):
        asyncio.run(usecase.execute(make_thread(), "Ещё", [], from_admin=False))

    asyncio.run(usecase.execute(make_thread(), "Ответ", [], from_admin=True))
