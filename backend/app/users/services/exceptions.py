"""Ошибки бизнес-логики пользователей. Роутеры переводят их в HTTP-коды."""


class InvalidNameError(ValueError):
    """Имя пустое или состоит не из букв."""


class InvalidPhoneError(ValueError):
    """Телефон не похож на номер."""


class CityNotFoundError(LookupError):
    """Указанного города нет в справочнике."""
