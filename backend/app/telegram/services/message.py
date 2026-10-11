"""Сообщение для Telegram из поста: текст с разметкой, ссылки на объявления и файлы."""

from html import escape
from io import BytesIO
from pathlib import Path

from PIL import Image

from app.core.telegram import TelegramFile
from app.posts.models import MediaKind, Post, PostMedia
from app.telegram.services.markup import Block, html_blocks

PHOTO_MAX_SIDE = 2560
PHOTO_QUALITY = 90


def post_url(site_url: str, post_id: int) -> str:
    """Адрес поста на сайте."""

    return f"{site_url.rstrip('/')}/posts/{post_id}"


def post_blocks(post: Post, site_url: str) -> list[Block]:
    """Текст поста и ссылки на прикреплённые объявления."""

    blocks = html_blocks(post.html)
    for listing in post.listings:
        url = f"{site_url.rstrip('/')}/listings/{listing.id}"
        html = f'Объявление: <a href="{escape(url)}">{escape(listing.title, quote=False)}</a>'
        blocks.append(Block(html, f"Объявление: {listing.title}", True))

    return blocks


def photo_content(path: Path) -> bytes:
    """Фото в JPEG не больше 2560 px по длинной стороне: так Telegram примет любое загруженное."""

    with Image.open(path) as image:
        photo = image.convert("RGB")
        photo.thumbnail((PHOTO_MAX_SIDE, PHOTO_MAX_SIDE))
        output = BytesIO()
        photo.save(output, format="JPEG", quality=PHOTO_QUALITY)

    return output.getvalue()


def telegram_files(media: list[PostMedia], media_dir: str) -> list[TelegramFile]:
    """Фото и видео поста по порядку, готовые к отправке."""

    files = []
    for item in media:
        path = Path(media_dir) / item.path
        if item.kind == MediaKind.VIDEO:
            files.append(TelegramFile("video", path.name, path.read_bytes()))
        else:
            files.append(TelegramFile("photo", f"{path.stem}.jpg", photo_content(path)))

    return files
