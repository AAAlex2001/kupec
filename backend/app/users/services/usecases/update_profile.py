"""Сценарий изменения профиля пользователя."""

from app.cities.services.repo import CityRepository
from app.users.models import User
from app.users.schemas import UserUpdateSchema
from app.users.services.exceptions import CityNotFoundError
from app.users.services.repo import UserRepository
from app.users.services.validators import normalize_name, normalize_phone


class UpdateProfileUseCase:
    """Изменить имя, телефон, город и настройки уведомлений."""

    def __init__(self, users: UserRepository, cities: CityRepository) -> None:
        self.users = users
        self.cities = cities

    async def execute(self, user: User, payload: UserUpdateSchema) -> User:
        """Вернуть обновлённого пользователя. Бросает ошибки имени, телефона и города."""

        changes = payload.model_dump(exclude_unset=True)

        if "name" in changes:
            changes["name"] = normalize_name(changes["name"])

        if "phone" in changes:
            changes["phone"] = normalize_phone(changes["phone"])

        city_id = changes.get("city_id")
        if city_id is not None and await self.cities.get_by_id(city_id) is None:
            raise CityNotFoundError(city_id)

        for field, value in changes.items():
            setattr(user, field, value)

        return await self.users.save(user)
