"""Репозитории входа: запросы к таблицам auth_codes и sessions."""

from datetime import datetime

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import AuthCode, Session


class AuthCodeRepository:
    """Доступ к таблице auth_codes. Сессию получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_issued_since(self, email: str, purpose: str, since: datetime) -> list[datetime]:
        """Когда выдавались коды на адрес начиная с since, от старых к новым."""

        stmt = (
            select(AuthCode.created_at)
            .where(
                AuthCode.email == email,
                AuthCode.purpose == purpose,
                AuthCode.created_at >= since,
            )
            .order_by(AuthCode.created_at)
        )
        result = await self.db.execute(stmt)

        return list(result.scalars().all())

    async def get_active_for_email(
        self, email: str, purpose: str, now: datetime
    ) -> AuthCode | None:
        """Последний неиспользованный и не истёкший код на адрес. Строка блокируется до commit."""

        stmt = (
            select(AuthCode)
            .where(
                AuthCode.email == email,
                AuthCode.purpose == purpose,
                AuthCode.used_at.is_(None),
                AuthCode.expires_at > now,
            )
            .order_by(AuthCode.created_at.desc())
            .limit(1)
            .with_for_update()
        )
        result = await self.db.execute(stmt)

        return result.scalar_one_or_none()

    async def get_active_for_user(
        self, user_id: int, purpose: str, now: datetime
    ) -> AuthCode | None:
        """Последний неиспользованный и не истёкший код пользователя. Строка блокируется до commit."""

        stmt = (
            select(AuthCode)
            .where(
                AuthCode.user_id == user_id,
                AuthCode.purpose == purpose,
                AuthCode.used_at.is_(None),
                AuthCode.expires_at > now,
            )
            .order_by(AuthCode.created_at.desc())
            .limit(1)
            .with_for_update()
        )
        result = await self.db.execute(stmt)

        return result.scalar_one_or_none()

    async def add(self, auth_code: AuthCode) -> AuthCode:
        """Сохранить новый код."""

        self.db.add(auth_code)
        await self.db.commit()

        return auth_code

    async def save(self, auth_code: AuthCode) -> AuthCode:
        """Сохранить изменения кода: например, счётчик попыток."""

        await self.db.commit()

        return auth_code


class SessionRepository:
    """Доступ к таблице sessions. Сессию БД получает снаружи, коммитит сам."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_active(self, token_hash: str, now: datetime) -> Session | None:
        """Не истёкшая сессия по хешу токена вместе с пользователем или None."""

        stmt = select(Session).where(Session.token_hash == token_hash, Session.expires_at > now)
        result = await self.db.execute(stmt)

        return result.scalar_one_or_none()

    async def add(self, session: Session) -> Session:
        """Сохранить новую сессию."""

        self.db.add(session)
        await self.db.commit()

        return session

    async def delete(self, session: Session) -> None:
        """Удалить сессию — выход на этом устройстве."""

        await self.db.delete(session)
        await self.db.commit()

    async def delete_all_for_user(self, user_id: int) -> None:
        """Удалить все сессии пользователя — выход на всех устройствах."""

        await self.db.execute(delete(Session).where(Session.user_id == user_id))
        await self.db.commit()
