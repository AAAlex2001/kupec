"""Сценарий отправки кода на почту."""

from datetime import datetime, timedelta, timezone

from app.auth.models import AuthCode, CodePurpose
from app.auth.services.repo import AuthCodeRepository
from app.auth.services.validators import HOUR, check_code_limit
from app.core.config import Settings
from app.core.mail import Mailer
from app.core.tokens import create_code, hash_code

SUBJECTS = {
    CodePurpose.VERIFY_EMAIL: "Подтверждение почты в Купце",
    CodePurpose.RESET_PASSWORD: "Восстановление пароля в Купце",
    CodePurpose.CHANGE_EMAIL: "Подтверждение новой почты в Купце",
}

TEXTS = {
    CodePurpose.VERIFY_EMAIL: "Код для подтверждения почты: {code}",
    CodePurpose.RESET_PASSWORD: "Код для восстановления пароля: {code}",
    CodePurpose.CHANGE_EMAIL: "Код для подтверждения новой почты: {code}",
}

FOOTER = "Код действует {minutes} минут. Если вы его не запрашивали, просто удалите письмо."


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
        text = TEXTS[purpose].format(code=code) + "\n\n" + FOOTER.format(minutes=minutes)

        await self.mailer.send(email, SUBJECTS[purpose], text)

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
