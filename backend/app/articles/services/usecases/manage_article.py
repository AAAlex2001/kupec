"""Сценарии обложки и удаления статьи."""

from fastapi import UploadFile
from sqlalchemy.exc import SQLAlchemyError

from app.articles.models import Article
from app.articles.services.repo import ArticleRepository
from app.core.uploads import remove_file, save_image

ARTICLES_FOLDER = "articles"


class SetArticleCoverUseCase:
    """Загрузить обложку и удалить прежнюю."""

    def __init__(self, articles: ArticleRepository) -> None:
        self.articles = articles

    async def execute(self, article: Article, file: UploadFile) -> Article:
        """Вернуть статью с новой обложкой. Бросает UploadError, если файл не подходит."""

        path = await save_image(file, ARTICLES_FOLDER)

        old_path = article.cover_path
        article.cover_path = path

        try:
            saved = await self.articles.save(article)
        except SQLAlchemyError:
            remove_file(path)
            raise

        if old_path is not None:
            remove_file(old_path)

        return saved


class RemoveArticleCoverUseCase:
    """Убрать обложку."""

    def __init__(self, articles: ArticleRepository) -> None:
        self.articles = articles

    async def execute(self, article: Article) -> Article:
        """Вернуть статью без обложки."""

        old_path = article.cover_path
        article.cover_path = None

        saved = await self.articles.save(article)

        if old_path is not None:
            remove_file(old_path)

        return saved


class DeleteArticleUseCase:
    """Удалить статью вместе с обложкой."""

    def __init__(self, articles: ArticleRepository) -> None:
        self.articles = articles

    async def execute(self, article: Article) -> None:
        """Удалить из базы и обложку с диска."""

        cover_path = article.cover_path
        await self.articles.delete(article)

        if cover_path is not None:
            remove_file(cover_path)
