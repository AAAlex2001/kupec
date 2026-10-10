from fastapi import APIRouter, Depends

from app.seo.dependencies import get_sitemap_repository
from app.seo.schemas import SitemapItemSchema, SitemapPageSchema, SitemapSchema
from app.seo.services.repo import SitemapRepository

router = APIRouter(prefix="/seo", tags=["seo"])


@router.get("/sitemap")
async def sitemap(sitemap: SitemapRepository = Depends(get_sitemap_repository)) -> SitemapSchema:
    """Объявления, посты, статьи и авторы для sitemap.xml сайта."""

    listings = await sitemap.listings()
    posts = await sitemap.posts()
    articles = await sitemap.articles()

    return SitemapSchema(
        listings=[SitemapItemSchema(id=id_, updated_at=updated) for id_, updated in listings],
        posts=[SitemapItemSchema(id=id_, updated_at=updated) for id_, updated in posts],
        articles=[SitemapPageSchema(path=path, updated_at=updated) for path, updated in articles],
        authors=await sitemap.authors(),
    )
