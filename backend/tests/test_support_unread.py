"""Счётчик считает сообщения, сбрасывается при чтении и увеличивается атомарно."""

import asyncio
from unittest.mock import AsyncMock

import sqlalchemy as sa

from app.support.models import SupportMessage, SupportThread
from app.support.services.repo import SupportRepository


def test_total_counts_messages_instead_of_threads() -> None:
    engine = sa.create_engine("sqlite://")
    with engine.begin() as connection:
        connection.exec_driver_sql("CREATE TABLE support_threads (unread_admin_count INTEGER)")
        connection.exec_driver_sql("INSERT INTO support_threads VALUES (3), (2), (0)")
        db = AsyncMock()
        db.scalar.side_effect = lambda statement: connection.scalar(statement)

        assert asyncio.run(SupportRepository(db).count_unread()) == 5


def test_read_resets_only_the_readers_counter() -> None:
    thread = SupportThread(unread_for_admin=True, unread_admin_count=3, unread_for_visitor=2)
    db = AsyncMock()

    asyncio.run(SupportRepository(db).mark_read(thread, by_admin=True))

    assert thread.unread_admin_count == 0
    assert thread.unread_for_admin is False
    assert thread.unread_for_visitor == 2
    db.commit.assert_awaited_once()


def test_incoming_message_increments_database_value_atomically() -> None:
    thread = SupportThread(id=1, unread_admin_count=0)
    db = AsyncMock()
    db.add = lambda message: None
    repo = SupportRepository(db)
    repo.get = AsyncMock(return_value=thread)

    asyncio.run(repo.add_message(SupportMessage(thread_id=1, from_admin=False)))

    engine = sa.create_engine("sqlite://")
    with engine.begin() as connection:
        connection.exec_driver_sql("CREATE TABLE support_threads (id INTEGER, unread_admin_count INTEGER)")
        connection.exec_driver_sql("INSERT INTO support_threads VALUES (1, 4)")
        connection.execute(
            sa.update(SupportThread).where(SupportThread.id == 1).values(unread_admin_count=thread.unread_admin_count)
        )

        assert connection.scalar(sa.select(SupportThread.unread_admin_count)) == 5
