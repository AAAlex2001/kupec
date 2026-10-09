"""Хеши паролей на Argon2: в базе хранится только хеш."""

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

hasher = PasswordHasher()


def hash_password(password: str) -> str:
    """Хеш пароля для базы."""

    return hasher.hash(password)


def password_matches(password: str, password_hash: str | None) -> bool:
    """Совпадает ли пароль с хешем. Нет хеша или хеш испорчен — False."""

    if password_hash is None:
        return False

    try:
        return hasher.verify(password_hash, password)
    except (VerificationError, InvalidHashError):
        return False
