"""Очистка текста поста из редактора."""

import nh3

ALLOWED_TAGS = {"p", "br", "h2", "h3", "strong", "em", "u", "blockquote", "a"}
ALLOWED_ATTRIBUTES = {"a": {"href"}}
ALLOWED_SCHEMES = {"http", "https"}


def clean_html(html: str) -> str:
    """HTML только с тегами редактора и ссылками http(s). Скрипты и атрибуты вырезаются."""

    return nh3.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        url_schemes=ALLOWED_SCHEMES,
    ).strip()


def has_text(html: str) -> bool:
    """Есть ли в HTML хоть какой-то текст."""

    return nh3.clean(html, tags=set()).strip() != ""
