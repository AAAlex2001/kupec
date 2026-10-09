"""Автопроверка отзыва перед модерацией."""

import re

CONTACTS_REASON = (
    "В тексте указаны контактные данные или ссылки. Уберите их и отправьте отзыв снова."
)

PHONE = re.compile(r"(\+7|8)[\s\-()]*\d([\s\-()]*\d){9}")
EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")
LINK = re.compile(r"(https?://|www\.|t\.me/)", re.IGNORECASE)


def clean_text(value: str | None) -> str | None:
    """Текст без пробелов по краям. Пустая строка — None."""

    if value is None:
        return None

    return value.strip() or None


def rejection_reason(text: str | None) -> str | None:
    """Почему отзыв отклоняется сразу: телефон, почта или ссылка. Всё в порядке — None."""

    if not text:
        return None

    if PHONE.search(text) or EMAIL.search(text) or LINK.search(text):
        return CONTACTS_REASON

    return None
