"""Карта сайта: репозиторий."""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.seo.services.repo import SitemapRepository


def get_sitemap_repository(session: AsyncSession = Depends(get_session)) -> SitemapRepository:
    """Репозиторий карты сайта с сессией текущего запроса."""

    return SitemapRepository(session)
