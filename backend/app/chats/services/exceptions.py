"""Ошибки переписки. Роутеры переводят их в HTTP-коды."""


class OwnListingError(ValueError):
    """Нельзя написать самому себе по своему объявлению."""


class EmptyMessageError(ValueError):
    """Сообщение пустое."""


class BlockedError(PermissionError):
    """Один из собеседников заблокировал другого — писать нельзя."""
