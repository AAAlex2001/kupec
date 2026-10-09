from pydantic import BaseModel, EmailStr, Field

CODE_PATTERN = r"^\d{6}$"
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128


class CodeRequestSchema(BaseModel):
    """Куда отправить код."""

    email: EmailStr = Field(..., max_length=254, description="Email")


class CodeSentSchema(BaseModel):
    """Код отправлен."""

    resend_after: int = Field(..., description="Через сколько секунд можно запросить код снова")
    expires_in: int = Field(..., description="Сколько секунд код действует")


class RegisterSchema(BaseModel):
    """Регистрация: почта и пароль. Почту потом подтверждают кодом из письма."""

    email: EmailStr = Field(..., max_length=254, description="Email")
    password: str = Field(
        ..., min_length=PASSWORD_MIN_LENGTH, max_length=PASSWORD_MAX_LENGTH, description="Пароль"
    )


class LoginSchema(BaseModel):
    """Вход по почте и паролю."""

    email: EmailStr = Field(..., max_length=254, description="Email")
    password: str = Field(..., min_length=1, max_length=PASSWORD_MAX_LENGTH, description="Пароль")


class EmailCodeSchema(BaseModel):
    """Код из письма, пришедший на почту."""

    email: EmailStr = Field(..., max_length=254, description="Email, на который пришёл код")
    code: str = Field(..., pattern=CODE_PATTERN, description="Код из письма")


class PasswordResetSchema(EmailCodeSchema):
    """Новый пароль по коду из письма."""

    password: str = Field(
        ...,
        min_length=PASSWORD_MIN_LENGTH,
        max_length=PASSWORD_MAX_LENGTH,
        description="Новый пароль",
    )


class CodeConfirmSchema(BaseModel):
    """Код из письма для подтверждения новой почты."""

    code: str = Field(..., pattern=CODE_PATTERN, description="Код из письма")
