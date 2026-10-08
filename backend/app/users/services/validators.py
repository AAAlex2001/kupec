"""Проверка и нормализация данных пользователя."""

from app.users.services.exceptions import InvalidNameError, InvalidPhoneError

PHONE_MIN_DIGITS = 10
PHONE_MAX_DIGITS = 15
RUSSIAN_PHONE_DIGITS = 11


def normalize_email(email: str) -> str:
    """Email в нижнем регистре без пробелов по краям, чтобы один адрес не стал двумя аккаунтами."""

    return email.strip().lower()


def normalize_name(name: str) -> str:
    """Имя без лишних пробелов: «  Анна   Смирнова » → «Анна Смирнова». Нужна хотя бы одна буква."""

    cleaned = " ".join(name.split())

    if not any(char.isalpha() for char in cleaned):
        raise InvalidNameError("Укажите имя")

    return cleaned


def normalize_phone(phone: str | None) -> str | None:
    """Телефон только из цифр с плюсом: «8 (999) 000-00-00» → «+79990000000». Пусто — None."""

    if phone is None or not phone.strip():
        return None

    digits = "".join(char for char in phone if char.isdigit())

    if len(digits) < PHONE_MIN_DIGITS or len(digits) > PHONE_MAX_DIGITS:
        raise InvalidPhoneError("Укажите телефон в формате +7 999 000-00-00")

    if len(digits) == RUSSIAN_PHONE_DIGITS and digits.startswith("8"):
        digits = "7" + digits[1:]

    return "+" + digits
