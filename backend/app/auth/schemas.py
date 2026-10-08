from pydantic import BaseModel, EmailStr, Field

CODE_PATTERN = r"^\d{6}$"


class CodeRequestSchema(BaseModel):
    """Куда отправить код."""

    email: EmailStr = Field(..., max_length=254, description="Email")


class CodeSentSchema(BaseModel):
    """Код отправлен."""

    resend_after: int = Field(..., description="Через сколько секунд можно запросить код снова")
    expires_in: int = Field(..., description="Сколько секунд код действует")


class LoginSchema(BaseModel):
    """Вход по коду из письма. Первый вход с этим email создаёт аккаунт."""

    email: EmailStr = Field(..., max_length=254, description="Email, на который пришёл код")
    code: str = Field(..., pattern=CODE_PATTERN, description="Код из письма")


class CodeConfirmSchema(BaseModel):
    """Код из письма для подтверждения новой почты."""

    code: str = Field(..., pattern=CODE_PATTERN, description="Код из письма")
