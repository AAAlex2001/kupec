class EmptySupportMessageError(ValueError):
    """Нет ни текста, ни фото."""


class TooManySupportPhotosError(ValueError):
    """К сообщению приложено больше фото, чем можно."""


class TooManySupportMessagesError(ValueError):
    """Посетитель пишет слишком часто: защита от спама."""
