"""Окружение для тестов: настройки не должны зависеть от локального .env."""

import os

os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5432/test")
os.environ.setdefault("CODE_SECRET", "test-code-secret-not-for-production-123456")
