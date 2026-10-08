"""Коды подтверждения из писем и токены сессий."""

import hashlib
import hmac
import secrets

from app.core.config import get_settings

CODE_DIGITS = 6


def create_code() -> str:
    """Случайный код из шести цифр для письма."""

    return f"{secrets.randbelow(10**CODE_DIGITS):0{CODE_DIGITS}d}"


def hash_code(code: str, email: str) -> str:
    """HMAC кода с секретом из настроек: по утёкшему хешу короткий код не подобрать."""

    message = f"{email}:{code}".encode()
    secret = get_settings().code_secret.encode()

    return hmac.new(secret, message, hashlib.sha256).hexdigest()


def code_matches(code: str, email: str, code_hash: str) -> bool:
    """Совпадает ли введённый код с хешем из БД. Сравнение за постоянное время."""

    return hmac.compare_digest(hash_code(code, email), code_hash)


def create_session_token() -> str:
    """Случайный токен сессии для cookie."""

    return secrets.token_urlsafe(32)


def hash_session_token(token: str) -> str:
    """SHA-256 токена: в БД хранится только он, сам токен знает лишь браузер."""

    return hashlib.sha256(token.encode()).hexdigest()
