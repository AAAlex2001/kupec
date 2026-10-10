"""Ошибки статей. Роутеры переводят их в HTTP-коды."""


class ArticleSlugTakenError(ValueError):
    """Статья с таким адресом уже есть."""
