"""Письма с кодами: тема, простой текст и HTML с логотипом."""

from dataclasses import dataclass
from pathlib import Path
from string import Template

from app.auth.models import CodePurpose

CODE_TEMPLATE = Template(
    (Path(__file__).resolve().parents[1] / "templates" / "code_letter.html").read_text(
        encoding="utf-8"
    )
)

SUBJECTS = {
    CodePurpose.VERIFY_EMAIL: "Подтверждение почты в Купце",
    CodePurpose.RESET_PASSWORD: "Восстановление пароля в Купце",
    CodePurpose.CHANGE_EMAIL: "Подтверждение новой почты в Купце",
}

TITLES = {
    CodePurpose.VERIFY_EMAIL: "Подтвердите почту",
    CodePurpose.RESET_PASSWORD: "Восстановление пароля",
    CodePurpose.CHANGE_EMAIL: "Подтвердите новую почту",
}

LEADS = {
    CodePurpose.VERIFY_EMAIL: "Введите этот код на сайте, чтобы подтвердить почту и войти в «Купец».",
    CodePurpose.RESET_PASSWORD: "Введите этот код на сайте, чтобы задать новый пароль.",
    CodePurpose.CHANGE_EMAIL: "Введите этот код на сайте, чтобы привязать эту почту к аккаунту.",
}

FOOTER = "Код действует {minutes} минут. Если вы его не запрашивали, просто удалите письмо."


@dataclass
class Letter:
    """Готовое письмо: тема, простой текст и HTML."""

    subject: str
    text: str
    html: str


def code_letter(purpose: CodePurpose, code: str, minutes: int, site_url: str) -> Letter:
    """Письмо с кодом: заголовок под задачу, крупный код и срок действия."""

    site_url = site_url.rstrip("/")
    text = f"{TITLES[purpose]}\n\n{LEADS[purpose]}\n\nКод: {code}\n\n" + FOOTER.format(
        minutes=minutes
    )
    html = CODE_TEMPLATE.substitute(
        title=TITLES[purpose],
        lead=LEADS[purpose],
        code=code,
        minutes=minutes,
        site_url=site_url,
        site_host=site_url.split("://")[-1],
    )

    return Letter(subject=SUBJECTS[purpose], text=text, html=html)
