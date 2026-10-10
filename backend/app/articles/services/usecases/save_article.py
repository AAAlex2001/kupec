"""Сценарии сохранения статьи из админки: создать и изменить."""

from datetime import datetime, timezone

from app.articles.models import Article, ArticleStatus
from app.articles.schemas import ArticleSaveSchema
from app.articles.services.exceptions import ArticleSlugTakenError
from app.articles.services.repo import ArticleRepository
from app.core.html import clean_html


class SaveArticleUseCase:
    """Общее для создания и правки: адрес свободен, текст очищен, дата публикации ставится один раз."""

    def __init__(self, articles: ArticleRepository) -> None:
        self.articles = articles

    async def fill(self, article: Article, payload: ArticleSaveSchema) -> None:
        """Перенести поля из формы в статью. Занятый адрес — ArticleSlugTakenError."""

        if await self.articles.slug_taken(payload.slug, article.id):
            raise ArticleSlugTakenError(payload.slug)

        article.section = payload.section
        article.slug = payload.slug
        article.title = payload.title.strip()
        article.description = payload.description.strip()
        article.html = clean_html(payload.html)
        article.seo_title = payload.seo_title.strip()
        article.seo_description = payload.seo_description.strip()
        article.seo_keywords = payload.seo_keywords.strip()

        if not payload.publish:
            article.status = ArticleStatus.DRAFT
            return

        article.status = ArticleStatus.PUBLISHED
        if article.published_at is None:
            article.published_at = datetime.now(timezone.utc)


class CreateArticleUseCase(SaveArticleUseCase):
    """Новая статья."""

    async def execute(self, payload: ArticleSaveSchema) -> Article:
        """Вернуть созданную статью."""

        article = Article()
        await self.fill(article, payload)

        return await self.articles.add(article)


class UpdateArticleUseCase(SaveArticleUseCase):
    """Правка статьи."""

    async def execute(self, article: Article, payload: ArticleSaveSchema) -> Article:
        """Вернуть изменённую статью."""

        await self.fill(article, payload)

        return await self.articles.save(article)
