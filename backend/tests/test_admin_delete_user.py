"""Удаление пользователя из админки: защита от удаления себя и админов, файлы и пересчёт чужих счётчиков."""

import asyncio

import pytest

from app.admin.services.exceptions import UserNotDeletableError
from app.admin.services.repo import UserTraces
from app.admin.services.usecases.delete_user import DeleteUserUseCase
from app.users.models import User

ADMIN = User(id=1, email="admin@mail.ru", is_admin=True)


class FakeUsers:
    """Следы пользователя заданы заранее, удаление запоминается."""

    def __init__(self, traces: UserTraces) -> None:
        self.traces_value = traces
        self.deleted: list[int] = []

    async def traces(self, user: User) -> UserTraces:
        return self.traces_value

    async def delete(self, user_id: int) -> None:
        self.deleted.append(user_id)


class FakeCounters:
    """Запоминает, какие счётчики пересчитали."""

    def __init__(self) -> None:
        self.calls: list[tuple] = []

    async def refresh_likes(self, item_id: int) -> int:
        self.calls.append(("likes", item_id))
        return 0

    async def refresh_reposts(self, post_id: int) -> None:
        self.calls.append(("reposts", post_id))

    async def refresh_count(self, post_id: int | None, article_id: int | None) -> None:
        self.calls.append(("comments", post_id, article_id))

    async def refresh_seller_rating(self, seller_id: int) -> None:
        self.calls.append(("rating", seller_id))


def traces(**values) -> UserTraces:
    empty = {
        "files": [],
        "liked_posts": [],
        "reposted_posts": [],
        "commented_posts": [],
        "commented_articles": [],
        "liked_comments": [],
        "liked_articles": [],
        "reviewed_sellers": [],
    }

    return UserTraces(**{**empty, **values})


def test_user_is_deleted_with_files_and_others_counters_refreshed(monkeypatch) -> None:
    removed: list[str] = []
    monkeypatch.setattr("app.admin.services.usecases.delete_user.remove_file", removed.append)
    users = FakeUsers(traces(files=["avatars/a.jpg"], liked_posts=[5], commented_articles=[7], reviewed_sellers=[9]))
    counters = FakeCounters()
    usecase = DeleteUserUseCase(users, counters, counters, counters, counters)

    asyncio.run(usecase.execute(ADMIN, User(id=2, email="u@mail.ru", is_admin=False)))

    assert users.deleted == [2]
    assert removed == ["avatars/a.jpg"]
    assert counters.calls == [("likes", 5), ("comments", None, 7), ("rating", 9)]


@pytest.mark.parametrize("user", [ADMIN, User(id=3, email="other@mail.ru", is_admin=True)])
def test_admin_cannot_delete_self_or_other_admin(user: User) -> None:
    users = FakeUsers(traces())
    usecase = DeleteUserUseCase(users, FakeCounters(), FakeCounters(), FakeCounters(), FakeCounters())

    with pytest.raises(UserNotDeletableError):
        asyncio.run(usecase.execute(ADMIN, user))

    assert users.deleted == []
