"""Ошибки входа и кодов из писем. Роутеры переводят их в HTTP-коды."""


class TooManyCodesError(Exception):
    """Код запрашивают слишком часто."""

    def __init__(self, retry_after: int) -> None:
        super().__init__(retry_after)
        self.retry_after = retry_after


class CodeExpiredError(LookupError):
    """Действующего кода нет: истёк, уже использован или кончились попытки."""


class InvalidCodeError(ValueError):
    """Введён неверный код."""

    def __init__(self, attempts_left: int) -> None:
        super().__init__(attempts_left)
        self.attempts_left = attempts_left


class EmailAlreadyTakenError(ValueError):
    """На этот email уже есть аккаунт."""


class SameEmailError(ValueError):
    """Новый email совпадает с текущим."""


class InvalidCredentialsError(ValueError):
    """Неверная почта или пароль. Какое из двух — не уточняем."""


class EmailNotVerifiedError(PermissionError):
    """Почта не подтверждена кодом из письма."""


class LoginLockedError(PermissionError):
    """Слишком много неверных паролей: вход временно закрыт."""

    def __init__(self, retry_after: int) -> None:
        super().__init__(retry_after)
        self.retry_after = retry_after
