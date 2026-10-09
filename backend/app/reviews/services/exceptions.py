"""Ошибки отзывов. Роутеры переводят их в HTTP-коды."""


class ReviewNotAllowedError(PermissionError):
    """Оставить отзыв нельзя: не было переписки, своё объявление или отзыв уже есть."""


class ReviewNotFoundError(LookupError):
    """Отзыва нет или он чужой."""


class ReviewPhotoNotFoundError(LookupError):
    """Фото нет, оно чужое или уже привязано к другому отзыву."""


class TooManyReviewPhotosError(ValueError):
    """Загружено слишком много фото, ещё не привязанных к отзыву."""
