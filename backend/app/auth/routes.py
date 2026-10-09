from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.auth.dependencies import (
    clear_session_cookie,
    get_confirm_email_change_usecase,
    get_confirm_email_usecase,
    get_current_session,
    get_login_usecase,
    get_register_usecase,
    get_request_email_change_usecase,
    get_request_password_reset_usecase,
    get_reset_password_usecase,
    get_session_repository,
    require_session,
    require_user,
    set_session_cookie,
)
from app.auth.models import Session
from app.auth.schemas import (
    CodeConfirmSchema,
    CodeRequestSchema,
    CodeSentSchema,
    EmailCodeSchema,
    LoginSchema,
    PasswordResetSchema,
    RegisterSchema,
)
from app.auth.services.exceptions import (
    CodeExpiredError,
    EmailAlreadyTakenError,
    EmailNotVerifiedError,
    InvalidCodeError,
    InvalidCredentialsError,
    LoginLockedError,
    SameEmailError,
    TooManyCodesError,
)
from app.auth.services.repo import SessionRepository
from app.auth.services.usecases.change_email import (
    ConfirmEmailChangeUseCase,
    RequestEmailChangeUseCase,
)
from app.auth.services.usecases.login import LoginUseCase
from app.auth.services.usecases.register import ConfirmEmailUseCase, RegisterUseCase
from app.auth.services.usecases.reset_password import (
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
)
from app.auth.services.validators import wait_message
from app.core.config import get_settings
from app.core.mail import MailError
from app.users.models import User
from app.users.schemas import UserSchema

router = APIRouter(prefix="/auth", tags=["auth"])

EMAIL_TAKEN = "На эту почту уже есть аккаунт. Войдите или восстановите пароль"


def code_sent() -> CodeSentSchema:
    """Ответ «код отправлен»: когда можно запросить снова и сколько он действует."""

    settings = get_settings()

    return CodeSentSchema(
        resend_after=settings.code_resend_seconds,
        expires_in=settings.code_expires_minutes * 60,
    )


def code_send_error(error: TooManyCodesError | MailError) -> HTTPException:
    """HTTP-ошибка, если код не отправлен: слишком часто или почта не работает."""

    if isinstance(error, TooManyCodesError):
        return HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=wait_message(error.retry_after),
            headers={"Retry-After": str(error.retry_after)},
        )

    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Не удалось отправить письмо. Попробуйте позже",
    )


def code_check_error(error: InvalidCodeError | CodeExpiredError) -> HTTPException:
    """HTTP-ошибка неверного или истёкшего кода из письма."""

    if isinstance(error, InvalidCodeError):
        detail = f"Неверный код. Осталось попыток: {error.attempts_left}"
    else:
        detail = str(error)

    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=detail)


@router.post("/register", status_code=status.HTTP_202_ACCEPTED)
async def register(
    payload: RegisterSchema,
    usecase: RegisterUseCase = Depends(get_register_usecase),
) -> CodeSentSchema:
    """Регистрация по почте и паролю. На почту приходит код подтверждения."""

    try:
        await usecase.execute(payload)
    except EmailAlreadyTakenError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=EMAIL_TAKEN) from error
    except (TooManyCodesError, MailError) as error:
        raise code_send_error(error) from error

    return code_sent()


@router.post("/register/confirm")
async def confirm_email(
    payload: EmailCodeSchema,
    response: Response,
    usecase: ConfirmEmailUseCase = Depends(get_confirm_email_usecase),
) -> UserSchema:
    """Подтвердить почту кодом из письма. После этого сразу выполняется вход."""

    try:
        user, token = await usecase.execute(payload)
    except (InvalidCodeError, CodeExpiredError) as error:
        raise code_check_error(error) from error

    set_session_cookie(response, token)

    return UserSchema.model_validate(user)


@router.post("/login")
async def login(
    payload: LoginSchema,
    response: Response,
    usecase: LoginUseCase = Depends(get_login_usecase),
) -> UserSchema:
    """Вход по почте и паролю."""

    try:
        user, token = await usecase.execute(payload)
    except InvalidCredentialsError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(error),
        ) from error
    except LoginLockedError as error:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Слишком много попыток. Попробуйте через {error.retry_after} мин",
        ) from error
    except EmailNotVerifiedError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Почта не подтверждена. Зарегистрируйтесь ещё раз, чтобы получить код",
        ) from error

    set_session_cookie(response, token)

    return UserSchema.model_validate(user)


@router.post("/password/reset", status_code=status.HTTP_202_ACCEPTED)
async def request_password_reset(
    payload: CodeRequestSchema,
    usecase: RequestPasswordResetUseCase = Depends(get_request_password_reset_usecase),
) -> CodeSentSchema:
    """Отправить код восстановления пароля. Есть ли аккаунт с этой почтой, ответ не раскрывает."""

    try:
        await usecase.execute(payload.email)
    except (TooManyCodesError, MailError) as error:
        raise code_send_error(error) from error

    return code_sent()


@router.post("/password/reset/confirm")
async def reset_password(
    payload: PasswordResetSchema,
    response: Response,
    usecase: ResetPasswordUseCase = Depends(get_reset_password_usecase),
) -> UserSchema:
    """Задать новый пароль по коду из письма. После этого сразу выполняется вход."""

    try:
        user, token = await usecase.execute(payload)
    except (InvalidCodeError, CodeExpiredError) as error:
        raise code_check_error(error) from error

    set_session_cookie(response, token)

    return UserSchema.model_validate(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    session: Session | None = Depends(get_current_session),
    sessions: SessionRepository = Depends(get_session_repository),
) -> None:
    """Выход на этом устройстве: сессия удаляется, cookie стирается."""

    if session is not None:
        await sessions.delete(session)

    clear_session_cookie(response)


@router.post("/logout-all", status_code=status.HTTP_204_NO_CONTENT)
async def logout_all(
    response: Response,
    session: Session = Depends(require_session),
    sessions: SessionRepository = Depends(get_session_repository),
) -> None:
    """Выход на всех устройствах."""

    await sessions.delete_all_for_user(session.user_id)

    clear_session_cookie(response)


@router.post("/email", status_code=status.HTTP_202_ACCEPTED)
async def request_email_change(
    payload: CodeRequestSchema,
    user: User = Depends(require_user),
    usecase: RequestEmailChangeUseCase = Depends(get_request_email_change_usecase),
) -> CodeSentSchema:
    """Смена почты: отправить код на новый адрес. Почта меняется после ввода кода."""

    try:
        await usecase.execute(user, payload)
    except SameEmailError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Это ваш текущий адрес",
        ) from error
    except EmailAlreadyTakenError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=EMAIL_TAKEN) from error
    except (TooManyCodesError, MailError) as error:
        raise code_send_error(error) from error

    return code_sent()


@router.post("/email/confirm")
async def confirm_email_change(
    payload: CodeConfirmSchema,
    user: User = Depends(require_user),
    usecase: ConfirmEmailChangeUseCase = Depends(get_confirm_email_change_usecase),
) -> UserSchema:
    """Подтвердить новую почту кодом из письма."""

    try:
        updated = await usecase.execute(user, payload)
    except (InvalidCodeError, CodeExpiredError) as error:
        raise code_check_error(error) from error
    except EmailAlreadyTakenError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=EMAIL_TAKEN) from error

    return UserSchema.model_validate(updated)
