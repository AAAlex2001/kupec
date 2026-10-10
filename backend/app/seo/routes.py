from fastapi import APIRouter, Depends

from app.seo.dependencies import get_sitemap_repository
from app.seo.schemas import SitemapItemSchema, SitemapSchema
from app.seo.services.repo import SitemapRepository

router = APIRouter(prefix="/seo", tags=["seo"])


@router.get("/sitemap")
async def sitemap(sitemap: SitemapRepository = Depends(get_sitemap_repository)) -> SitemapSchema:
    """Объявления, посты и авторы для sitemap.xml сайта."""

    listings = await sitemap.listings()
    posts = await sitemap.posts()

    return SitemapSchema(
        listings=[SitemapItemSchema(id=id_, updated_at=updated) for id_, updated in listings],
        posts=[SitemapItemSchema(id=id_, updated_at=updated) for id_, updated in posts],
        authors=await sitemap.authors(),
    )
