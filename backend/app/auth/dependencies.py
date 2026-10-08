"""Вход: репозитории, фабрики сценариев, cookie сессии и защита ручек."""

from datetime import datetime, timezone

from fastapi import Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import Session
from app.auth.services.repo import AuthCodeRepository, SessionRepository
from app.auth.services.usecases.change_email import (
    ConfirmEmailChangeUseCase,
    RequestEmailChangeUseCase,
)
from app.auth.services.usecases.login import LoginUseCase
from app.auth.services.usecases.send_code import SendCodeUseCase
from app.core.config import get_settings
from app.core.database import get_session
from app.core.mail import Mailer
from app.core.tokens import hash_session_token
from app.users.dependencies import get_user_repository
from app.users.models import User
from app.users.services.repo import UserRepository

SESSION_COOKIE = "session"
SECONDS_IN_DAY = 60 * 60 * 24


def get_code_repository(
    session: AsyncSession = Depends(get_session),
) -> AuthCodeRepository:
    """Репозиторий кодов из писем с сессией текущего запроса."""

    return AuthCodeRepository(session)


def get_session_repository(
    session: AsyncSession = Depends(get_session),
) -> SessionRepository:
    """Репозиторий сессий входа с сессией БД текущего запроса."""

    return SessionRepository(session)


def get_mailer() -> Mailer:
    """Отправитель писем с настройками SMTP."""

    return Mailer(get_settings())


def get_send_code_usecase(
    codes: AuthCodeRepository = Depends(get_code_repository),
    mailer: Mailer = Depends(get_mailer),
) -> SendCodeUseCase:
    """Сценарий отправки кода."""

    return SendCodeUseCase(codes, mailer, get_settings())


def get_login_usecase(
    codes: AuthCodeRepository = Depends(get_code_repository),
    users: UserRepository = Depends(get_user_repository),
    sessions: SessionRepository = Depends(get_session_repository),
) -> LoginUseCase:
    """Сценарий входа."""

    return LoginUseCase(codes, users, sessions, get_settings())


def get_request_email_change_usecase(
    users: UserRepository = Depends(get_user_repository),
    send_code: SendCodeUseCase = Depends(get_send_code_usecase),
) -> RequestEmailChangeUseCase:
    """Сценарий запроса смены почты."""

    return RequestEmailChangeUseCase(users, send_code)


def get_confirm_email_change_usecase(
    codes: AuthCodeRepository = Depends(get_code_repository),
    users: UserRepository = Depends(get_user_repository),
) -> ConfirmEmailChangeUseCase:
    """Сценарий подтверждения новой почты."""

    return ConfirmEmailChangeUseCase(codes, users, get_settings())


def set_session_cookie(response: Response, token: str) -> None:
    """Положить токен в httponly-cookie: JavaScript её не видит, браузер шлёт сам."""

    settings = get_settings()

    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=settings.session_expires_days * SECONDS_IN_DAY,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    """Удалить cookie с токеном."""

    response.delete_cookie(SESSION_COOKIE, path="/")


async def get_current_session(
    request: Request,
    sessions: SessionRepository = Depends(get_session_repository),
) -> Session | None:
    """Сессия по токену из cookie. None — гость или сессия истекла."""

    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        return None

    return await sessions.get_active(hash_session_token(token), datetime.now(timezone.utc))


async def require_session(
    session: Session | None = Depends(get_current_session),
) -> Session:
    """Сессия текущего входа. Без неё — 401."""

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Требуется вход",
        )

    return session


async def require_user(session: Session = Depends(require_session)) -> User:
    """Пользователь текущего входа. Без входа — 401."""

    return session.user


async def get_current_user(
    session: Session | None = Depends(get_current_session),
) -> User | None:
    """Пользователь текущего входа или None для гостя."""

    return session.user if session else None
