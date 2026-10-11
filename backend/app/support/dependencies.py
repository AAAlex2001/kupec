"""Поддержка: репозиторий и сценарий отправки сообщения."""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.support.services.repo import SupportRepository
from app.support.services.usecases.send_message import SendSupportMessageUseCase


def get_support_repository(session: AsyncSession = Depends(get_session)) -> SupportRepository:
    """Репозиторий поддержки с сессией текущего запроса."""

    return SupportRepository(session)


def get_send_support_message_usecase(
    support: SupportRepository = Depends(get_support_repository),
) -> SendSupportMessageUseCase:
    """Сценарий сообщения в поддержку."""

    return SendSupportMessageUseCase(support)
