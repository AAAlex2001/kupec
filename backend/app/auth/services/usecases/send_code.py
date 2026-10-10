"""Сценарий отправки кода на почту."""

from datetime import datetime, timedelta, timezone

from app.auth.models import AuthCode, CodePurpose
from app.auth.services.letters import code_letter
from app.auth.services.repo import AuthCodeRepository
from app.auth.services.validators import HOUR, check_code_limit
from app.core.config import Settings
from app.core.mail import Mailer
from app.core.tokens import create_code, hash_code


class SendCodeUseCase:
    """Выдать код и отправить письмо, не чаще лимитов из настроек."""

    def __init__(self, codes: AuthCodeRepository, mailer: Mailer, settings: Settings) -> None:
        self.codes = codes
        self.mailer = mailer
        self.settings = settings

    async def execute(self, email: str, purpose: CodePurpose, user_id: int | None = None) -> None:
        """Отправить код. Бросает TooManyCodesError при частых запросах и MailError от SMTP."""

        now = datetime.now(timezone.utc)

        issued = await self.codes.list_issued_since(email, purpose, now - HOUR)
        check_code_limit(
            issued, now, self.settings.code_resend_seconds, self.settings.codes_per_hour
        )

        code = create_code()
        minutes = self.settings.code_expires_minutes
        letter = code_letter(purpose, code, minutes, self.settings.site_url)

        await self.mailer.send(email, letter.subject, letter.text, letter.html)

        await self.codes.add(
            AuthCode(
                email=email,
                purpose=purpose,
                user_id=user_id,
                code_hash=hash_code(code, email),
                attempts=0,
                created_at=now,
                expires_at=now + timedelta(minutes=minutes),
            )
        )
