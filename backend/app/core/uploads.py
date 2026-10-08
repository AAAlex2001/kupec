"""Сохранение загруженных картинок в каталог media на сервере."""

from io import BytesIO
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError

from app.core.config import MEDIA_URL, get_settings

MEGABYTE = 1024 * 1024
IMAGE_MAX_SIZE_BYTES = 10 * MEGABYTE
IMAGE_EXTENSIONS = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp"}
JPEG_QUALITY = 90


class UploadError(ValueError):
    """Файл не подходит: это не картинка или превышен размер."""


def detect_extension(content: bytes) -> str:
    """Определить формат картинки по содержимому, а не по заголовку от клиента."""

    try:
        with Image.open(BytesIO(content)) as image:
            image.verify()
            image_format = image.format
    except (UnidentifiedImageError, Image.DecompressionBombError, OSError, SyntaxError) as error:
        raise UploadError("Файл не является изображением") from error

    extension = IMAGE_EXTENSIONS.get(image_format or "")
    if extension is None:
        raise UploadError("Допустимы только JPEG, PNG и WebP")

    return extension


def strip_metadata(content: bytes) -> bytes:
    """Пересохранить картинку без EXIF и XMP: в фото с телефона там координаты места съёмки."""

    with Image.open(BytesIO(content)) as image:
        image_format = image.format
        icc_profile = image.info.get("icc_profile")

        upright = ImageOps.exif_transpose(image)
        upright.info.clear()

        output = BytesIO()
        upright.save(output, format=image_format, icc_profile=icc_profile, quality=JPEG_QUALITY)

    return output.getvalue()


async def save_image(file: UploadFile, folder: str) -> str:
    """Сохранить картинку в папку внутри media. Возвращает путь относительно media."""

    content = await file.read(IMAGE_MAX_SIZE_BYTES + 1)
    if len(content) > IMAGE_MAX_SIZE_BYTES:
        raise UploadError(f"Файл больше {IMAGE_MAX_SIZE_BYTES // MEGABYTE} МБ")

    extension = detect_extension(content)
    cleaned = strip_metadata(content)

    directory = Path(get_settings().media_dir) / folder
    directory.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid4().hex}{extension}"
    (directory / filename).write_bytes(cleaned)

    return f"{folder}/{filename}"


def remove_image(path: str) -> None:
    """Удалить файл картинки. Если его уже нет на диске, молчим: цель достигнута."""

    (Path(get_settings().media_dir) / path).unlink(missing_ok=True)


def image_url(path: str | None) -> str | None:
    """Адрес картинки для сайта по пути внутри media."""

    if path is None:
        return None

    return f"{MEDIA_URL}/{path}"
