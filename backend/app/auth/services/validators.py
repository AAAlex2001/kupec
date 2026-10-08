"""Проверки кодов из писем: частота отправки и срок жизни."""

import math
from datetime import datetime, timedelta

from app.auth.models import AuthCode
from app.auth.services.exceptions import CodeExpiredError, TooManyCodesError

HOUR = timedelta(hours=1)


def seconds_until(moment: datetime, now: datetime) -> int:
    """Сколько целых секунд осталось до moment, минимум одна."""

    return max(1, math.ceil((moment - now).total_seconds()))


def wait_message(seconds: int) -> str:
    """Когда можно запросить новый код: до минуты — в секундах, дольше — в минутах."""

    if seconds < 60:
        return f"Новый код можно запросить через {seconds} с"

    return f"Новый код можно запросить через {math.ceil(seconds / 60)} мин"


def check_code_limit(
    issued: list[datetime], now: datetime, resend_seconds: int, per_hour: int
) -> None:
    """Не чаще раза в resend_seconds и не больше per_hour кодов в час на один адрес.

    issued — когда выдавались коды на адрес за последний час, от старых к новым.
    """

    if issued:
        resend_at = issued[-1] + timedelta(seconds=resend_seconds)
        if resend_at > now:
            raise TooManyCodesError(seconds_until(resend_at, now))

    if len(issued) >= per_hour:
        raise TooManyCodesError(seconds_until(issued[0] + HOUR, now))


def validate_code_alive(auth_code: AuthCode | None, max_attempts: int) -> AuthCode:
    """Код есть и попытки не кончились. Иначе CodeExpiredError — нужно запросить новый."""

    if auth_code is None or auth_code.attempts >= max_attempts:
        raise CodeExpiredError("Код устарел, запросите новый")

    return auth_code
