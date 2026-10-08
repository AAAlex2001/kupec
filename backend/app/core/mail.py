"""Отправка писем через SMTP. Без SMTP_HOST письма пишутся в лог — для локальной разработки."""

import logging
from email.message import EmailMessage

import aiosmtplib

from app.core.config import Settings

logger = logging.getLogger(__name__)


class MailError(Exception):
    """Письмо не удалось отправить."""


class Mailer:
    """Отправитель писем с настройками SMTP."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def send(self, to: str, subject: str, text: str) -> None:
        """Отправить текстовое письмо. Ошибку SMTP превращает в MailError."""

        if not self.settings.smtp_host:
            logger.warning("Письмо для %s: %s\n%s", to, subject, text)
            return

        message = EmailMessage()
        message["From"] = self.settings.smtp_from
        message["To"] = to
        message["Subject"] = subject
        message.set_content(text)

        try:
            await aiosmtplib.send(
                message,
                hostname=self.settings.smtp_host,
                port=self.settings.smtp_port,
                username=self.settings.smtp_user or None,
                password=self.settings.smtp_password or None,
                start_tls=True,
            )
        except aiosmtplib.SMTPException as error:
            raise MailError(str(error)) from error
