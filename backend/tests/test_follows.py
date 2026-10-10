"""Тесты подписок и открытого профиля без БД."""

import asyncio

import pytest

from app.follows.services.exceptions import FollowNotAllowedError
from app.follows.services.usecases.follow_author import FollowAuthorUseCase
from app.users.models import User
from app.users.schemas import PublicUserSchema
from tests.fakes import FakeNotify

READER = User(id=1, email="anna@mail.ru", name="Анна")
AUTHOR = User(id=2, email="oleg@mail.ru", name="Олег")


class FakeFollowRepository:
    def __init__(self) -> None:
        self.pairs: set[tuple[int, int]] = set()

    async def add(self, follower_id: int, author_id: int) -> None:
        self.pairs.add((follower_id, author_id))


class FakeUserRepository:
    async def get_by_id(self, user_id: int) -> User | None:
        return AUTHOR if user_id == AUTHOR.id else None


def follow(follows: FakeFollowRepository, author_id: int) -> None:
    usecase = FollowAuthorUseCase(follows, FakeUserRepository(), FakeNotify())
    asyncio.run(usecase.execute(READER, author_id))


def test_follow_author_but_not_self_or_missing() -> None:
    follows = FakeFollowRepository()

    follow(follows, AUTHOR.id)
    assert follows.pairs == {(READER.id, AUTHOR.id)}

    with pytest.raises(FollowNotAllowedError):
        follow(follows, READER.id)

    with pytest.raises(FollowNotAllowedError):
        follow(follows, 99)


def test_public_profile_hides_contacts() -> None:
    assert "email" not in PublicUserSchema.model_fields
    assert "phone" not in PublicUserSchema.model_fields
