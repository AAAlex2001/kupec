"""Ошибки бизнес-логики объявлений. Роутеры переводят их в HTTP-коды."""


class InvalidListingError(ValueError):
    """Объявление заполнено неверно. errors — текст ошибки по каждому полю."""

    def __init__(self, errors: dict[str, str]) -> None:
        super().__init__(errors)
        self.errors = errors


class ListingNotFoundError(LookupError):
    """Объявления нет или оно не опубликовано."""


class PhotoNotFoundError(LookupError):
    """Фото нет, оно чужое или уже привязано к объявлению."""


class TooManyPhotosError(ValueError):
    """Загружено слишком много фото, ещё не привязанных к объявлению."""


class ListingStatusError(ValueError):
    """Из текущего состояния объявления такое действие недоступно."""
