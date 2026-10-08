"""Тесты профиля пользователя без БД."""

import asyncio
from io import BytesIO
from pathlib import Path

import pytest
from fastapi import UploadFile
from PIL import Image
from pydantic import ValidationError

from app.cities.models import City
from app.core import uploads
from app.core.config import Settings
from app.core.uploads import UploadError
from app.users.models import User
from app.users.schemas import UserUpdateSchema
from app.users.services.exceptions import CityNotFoundError, InvalidNameError, InvalidPhoneError
from app.users.services.usecases.manage_avatar import RemoveAvatarUseCase, SetAvatarUseCase
from app.users.services.usecases.update_profile import UpdateProfileUseCase
from tests.fakes import FakeCityRepository, FakeUserRepository

IRKUTSK = City(id=1, name="Иркутск")


def make_user() -> User:
    return User(id=1, email="anna@mail.ru")


def update(user: User, **changes) -> User:
    usecase = UpdateProfileUseCase(FakeUserRepository(), FakeCityRepository([IRKUTSK]))

    return asyncio.run(usecase.execute(user, UserUpdateSchema(**changes)))


def make_upload(content: bytes) -> UploadFile:
    return UploadFile(file=BytesIO(content), filename="avatar.png")


def png_bytes() -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (20, 20), (40, 90, 230)).save(buffer, format="PNG")

    return buffer.getvalue()


@pytest.fixture
def media_dir(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    settings = Settings(
        database_url="postgresql+asyncpg://test:test@localhost:5432/test",
        code_secret="test-code-secret-not-for-production-123456",
        media_dir=str(tmp_path),
    )
    monkeypatch.setattr(uploads, "get_settings", lambda: settings)

    return tmp_path


def test_update_normalizes_name_and_phone() -> None:
    user = update(make_user(), name="  Анна   Смирнова ", phone="8 (999) 000-00-00")

    assert user.name == "Анна Смирнова"
    assert user.phone == "+79990000000"


def test_update_changes_only_passed_fields() -> None:
    user = make_user()
    user.name = "Анна"
    user.notify_site = True

    updated = update(user, notify_site=False)

    assert (updated.name, updated.notify_site) == ("Анна", False)


def test_phone_can_be_removed() -> None:
    user = make_user()
    user.phone = "+79990000000"

    assert update(user, phone=None).phone is None


@pytest.mark.parametrize("name", ["   ", "123", "--"])
def test_name_needs_letters(name: str) -> None:
    with pytest.raises(InvalidNameError):
        update(make_user(), name=name)


def test_name_and_notifications_cannot_be_null() -> None:
    with pytest.raises(ValidationError):
        UserUpdateSchema(name=None)

    with pytest.raises(ValidationError):
        UserUpdateSchema(notify_site=None)


@pytest.mark.parametrize("phone", ["12345", "+7 999 000 00 00 00 00 00"])
def test_invalid_phone_is_rejected(phone: str) -> None:
    with pytest.raises(InvalidPhoneError):
        update(make_user(), phone=phone)


def test_city_must_exist() -> None:
    assert update(make_user(), city_id=IRKUTSK.id).city_id == IRKUTSK.id

    with pytest.raises(CityNotFoundError):
        update(make_user(), city_id=999)


def test_new_avatar_replaces_previous_file(media_dir: Path) -> None:
    usecase = SetAvatarUseCase(FakeUserRepository())
    user = make_user()

    asyncio.run(usecase.execute(user, make_upload(png_bytes())))
    first_path = user.avatar_path
    asyncio.run(usecase.execute(user, make_upload(png_bytes())))

    assert first_path != user.avatar_path
    assert not (media_dir / first_path).exists()
    assert (media_dir / user.avatar_path).exists()
    assert user.avatar_url == f"/media/{user.avatar_path}"


def test_avatar_rejects_file_that_is_not_an_image(media_dir: Path) -> None:
    user = make_user()

    with pytest.raises(UploadError):
        asyncio.run(SetAvatarUseCase(FakeUserRepository()).execute(user, make_upload(b"text")))

    assert user.avatar_path is None
    assert list(media_dir.iterdir()) == []


def test_uploaded_photo_is_saved_without_exif(media_dir: Path) -> None:
    exif = Image.Exif()
    exif[0x010F] = "Phone"
    buffer = BytesIO()
    Image.new("RGB", (20, 20)).save(buffer, format="JPEG", exif=exif)
    user = make_user()

    asyncio.run(SetAvatarUseCase(FakeUserRepository()).execute(user, make_upload(buffer.getvalue())))

    with Image.open(media_dir / user.avatar_path) as saved:
        assert dict(saved.getexif()) == {}


def test_remove_avatar_deletes_file(media_dir: Path) -> None:
    user = make_user()
    asyncio.run(SetAvatarUseCase(FakeUserRepository()).execute(user, make_upload(png_bytes())))
    path = user.avatar_path

    asyncio.run(RemoveAvatarUseCase(FakeUserRepository()).execute(user))

    assert user.avatar_path is None
    assert not (media_dir / path).exists()
