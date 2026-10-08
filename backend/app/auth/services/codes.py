"""Использование кода из письма: общий шаг входа и смены почты."""

from datetime import datetime, timezone

from app.auth.models import AuthCode
from app.auth.services.exceptions import CodeExpiredError, InvalidCodeError
from app.auth.services.repo import AuthCodeRepository
from app.auth.services.validators import validate_code_alive
from app.core.tokens import code_matches


async def use_code(
    codes: AuthCodeRepository,
    auth_code: AuthCode | None,
    code: str,
    max_attempts: int,
) -> AuthCode:
    """Сверить введённый код и пометить его использованным.

    Неверная попытка сохраняется сразу. Отметку об использовании коммитит следующая запись
    сценария — вместе с пользователем или сессией.
    """

    auth_code = validate_code_alive(auth_code, max_attempts)

    if not code_matches(code, auth_code.email, auth_code.code_hash):
        auth_code.attempts += 1
        await codes.save(auth_code)

        attempts_left = max_attempts - auth_code.attempts
        if attempts_left == 0:
            raise CodeExpiredError("Попытки кончились, запросите новый код")

        raise InvalidCodeError(attempts_left)

    auth_code.used_at = datetime.now(timezone.utc)

    return auth_code
