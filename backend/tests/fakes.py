"""Репозитории и отправитель писем в памяти для тестов сценариев без БД."""

import re
from datetime import datetime

from app.auth.models import AuthCode, Session
from app.cities.models import City
from app.core.config import Settings
from app.users.models import User


def make_settings() -> Settings:
    """Настройки с лимитами по умолчанию."""

    return Settings(
        database_url="postgresql+asyncpg://test:test@localhost:5432/test",
        code_secret="test-code-secret-not-for-production-123456",
    )


class FakeMailer:
    """Складывает письма в список вместо отправки."""

    def __init__(self) -> None:
        self.sent: list[tuple[str, str, str]] = []

    async def send(self, to: str, subject: str, text: str) -> None:
        self.sent.append((to, subject, text))

    def last_code(self) -> str:
        """Код из последнего письма."""

        _, _, text = self.sent[-1]
        match = re.search(r"\d{6}", text)
        assert match is not None

        return match.group()


class FakeUserRepository:
    """Пользователи в словаре по id."""

    def __init__(self) -> None:
        self.items: dict[int, User] = {}

    async def get_by_id(self, user_id: int) -> User | None:
        return self.items.get(user_id)

    async def get_by_email(self, email: str) -> User | None:
        for user in self.items.values():
            if user.email == email:
                return user

        return None

    async def add(self, user: User) -> User:
        user.id = len(self.items) + 1
        self.items[user.id] = user

        return user

    async def save(self, user: User) -> User:
        return user


class FakeCityRepository:
    """Города в словаре по id."""

    def __init__(self, cities: list[City]) -> None:
        self.items = {city.id: city for city in cities}

    async def get_by_id(self, city_id: int) -> City | None:
        return self.items.get(city_id)


class FakeCodeRepository:
    """Коды из писем в списке."""

    def __init__(self) -> None:
        self.items: list[AuthCode] = []

    async def list_issued_since(self, email: str, purpose: str, since: datetime) -> list[datetime]:
        return [
            code.created_at
            for code in self.items
            if code.email == email and code.purpose == purpose and code.created_at >= since
        ]

    async def get_active_for_email(
        self, email: str, purpose: str, now: datetime
    ) -> AuthCode | None:
        active = [
            code
            for code in self.items
            if code.email == email
            and code.purpose == purpose
            and code.used_at is None
            and code.expires_at > now
        ]

        return active[-1] if active else None

    async def get_active_for_user(
        self, user_id: int, purpose: str, now: datetime
    ) -> AuthCode | None:
        active = [
            code
            for code in self.items
            if code.user_id == user_id
            and code.purpose == purpose
            and code.used_at is None
            and code.expires_at > now
        ]

        return active[-1] if active else None

    async def add(self, auth_code: AuthCode) -> AuthCode:
        self.items.append(auth_code)

        return auth_code

    async def save(self, auth_code: AuthCode) -> AuthCode:
        return auth_code


class FakeSessionRepository:
    """Сессии входа в списке."""

    def __init__(self) -> None:
        self.items: list[Session] = []

    async def get_active(self, token_hash: str, now: datetime) -> Session | None:
        for session in self.items:
            if session.token_hash == token_hash and session.expires_at > now:
                return session

        return None

    async def add(self, session: Session) -> Session:
        self.items.append(session)

        return session

    async def delete(self, session: Session) -> None:
        self.items.remove(session)

    async def delete_all_for_user(self, user_id: int) -> None:
        self.items = [session for session in self.items if session.user_id != user_id]
