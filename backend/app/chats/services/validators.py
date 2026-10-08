"""Проверки сообщений."""

from app.chats.services.exceptions import EmptyMessageError


def normalize_message_text(text: str) -> str:
    """Текст без пробелов по краям. Пустой — EmptyMessageError."""

    text = text.strip()
    if not text:
        raise EmptyMessageError("Напишите сообщение")

    return text
