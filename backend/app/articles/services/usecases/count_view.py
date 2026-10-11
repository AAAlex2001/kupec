"""Сценарий подсчёта просмотра статьи."""

from datetime import datetime, timezone

from app.articles.models import Article
from app.articles.services.repo import ArticleRepository, ArticleViewRepository


class CountArticleViewUseCase:
    """Засчитать просмотр: один посетитель — один раз в сутки."""

    def __init__(self, articles: ArticleRepository, views: ArticleViewRepository) -> None:
        self.articles = articles
        self.views = views

    async def execute(self, article: Article, visitor: str) -> None:
        """Прибавить просмотр, если посетитель сегодня эту статью ещё не открывал."""

        today = datetime.now(timezone.utc).date()
        if await self.views.add_once(article.id, visitor, today):
            await self.articles.add_view(article.id)
