"""Сценарии смены почты: код уходит на новый адрес, почта меняется после ввода кода."""

from datetime import datetime, timezone

from sqlalchemy.exc import IntegrityError

from app.auth.models import CodePurpose
from app.auth.schemas import CodeConfirmSchema, CodeRequestSchema
from app.auth.services.codes import use_code
from app.auth.services.exceptions import EmailAlreadyTakenError, SameEmailError
from app.auth.services.repo import AuthCodeRepository
from app.auth.services.usecases.send_code import SendCodeUseCase
from app.core.config import Settings
from app.users.models import User
from app.users.services.repo import UserRepository
from app.users.services.validators import normalize_email


class RequestEmailChangeUseCase:
    """Проверить новый адрес и отправить на него код."""

    def __init__(self, users: UserRepository, send_code: SendCodeUseCase) -> None:
        self.users = users
        self.send_code = send_code

    async def execute(self, user: User, payload: CodeRequestSchema) -> None:
        """Отправить код на новый адрес. Бросает ошибки занятого и того же адреса."""

        email = normalize_email(payload.email)

        if email == user.email:
            raise SameEmailError(email)

        if await self.users.get_by_email(email) is not None:
            raise EmailAlreadyTakenError(email)

        await self.send_code.execute(email, CodePurpose.CHANGE_EMAIL, user.id)


class ConfirmEmailChangeUseCase:
    """Сверить код с нового адреса и заменить им почту пользователя."""

    def __init__(
        self, codes: AuthCodeRepository, users: UserRepository, settings: Settings
    ) -> None:
        self.codes = codes
        self.users = users
        self.settings = settings

    async def execute(self, user: User, payload: CodeConfirmSchema) -> User:
        """Вернуть пользователя с новой почтой. Бросает ошибки кода и занятого адреса."""

        now = datetime.now(timezone.utc)

        auth_code = await self.codes.get_active_for_user(user.id, CodePurpose.CHANGE_EMAIL, now)
        auth_code = await use_code(
            self.codes, auth_code, payload.code, self.settings.code_max_attempts
        )

        if await self.users.get_by_email(auth_code.email) is not None:
            raise EmailAlreadyTakenError(auth_code.email)

        user.email = auth_code.email

        try:
            return await self.users.save(user)
        except IntegrityError as error:
            raise EmailAlreadyTakenError(auth_code.email) from error
