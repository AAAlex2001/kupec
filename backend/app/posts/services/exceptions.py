"""Ошибки публикаций. Роутеры переводят их в HTTP-коды."""


class CommentNotFoundError(LookupError):
    """Комментария нет или он к другому посту."""


class EmptyPostError(ValueError):
    """В посте нет ни текста, ни файлов, ни объявлений."""


class PostListingNotFoundError(LookupError):
    """Объявления нет, оно чужое или снято с публикации."""


class PostMediaNotFoundError(LookupError):
    """Файла нет, он чужой или уже привязан к посту."""


class TooManyPostMediaError(ValueError):
    """Загружено слишком много файлов, ещё не привязанных к посту."""


class TooManyAiRequestsError(ValueError):
    """Лимит запросов к ИИ на час исчерпан. retry_after — через сколько секунд можно снова."""

    def __init__(self, retry_after: int) -> None:
        super().__init__(retry_after)
        self.retry_after = retry_after


class EmptyAiAnswerError(ValueError):
    """Модель ответила, но после очистки в ответе не осталось текста."""
