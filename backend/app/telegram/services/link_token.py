"""Токен из ссылки t.me/<бот>?start=<токен>: по нему бот узнаёт, кто пришёл с сайта."""

import hashlib
import hmac
import time

from app.core.config import get_settings

TOKEN_LIFETIME_SECONDS = 60 * 60
SIGNATURE_LENGTH = 24


def sign(user_id: int, expires: int) -> str:
    """Подпись токена секретом из настроек: подделать токен для чужого id нельзя."""

    message = f"telegram:{user_id}:{expires}".encode()
    secret = get_settings().code_secret.encode()

    return hmac.new(secret, message, hashlib.sha256).hexdigest()[:SIGNATURE_LENGTH]


def create_link_token(user_id: int) -> str:
    """Токен на час вида <id>-<срок>-<подпись>. Telegram пропускает в нём только буквы, цифры, _ и -."""

    expires = int(time.time()) + TOKEN_LIFETIME_SECONDS

    return f"{user_id}-{expires}-{sign(user_id, expires)}"


def read_link_token(token: str) -> int | None:
    """Id пользователя из токена. Испорченный или просроченный — None."""

    parts = token.split("-")
    if len(parts) != 3 or not parts[0].isdigit() or not parts[1].isdigit():
        return None

    user_id, expires = int(parts[0]), int(parts[1])
    if expires < time.time() or not hmac.compare_digest(parts[2], sign(user_id, expires)):
        return None

    return user_id
