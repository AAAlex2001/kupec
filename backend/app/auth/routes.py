from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.auth.dependencies import (
    clear_session_cookie,
    get_confirm_email_change_usecase,
    get_current_session,
    get_login_usecase,
    get_request_email_change_usecase,
    get_send_code_usecase,
    get_session_repository,
    require_session,
    require_user,
    set_session_cookie,
)
from app.auth.models import CodePurpose, Session
from app.auth.schemas import CodeConfirmSchema, CodeRequestSchema, CodeSentSchema, LoginSchema
from app.auth.services.exceptions import (
    CodeExpiredError,
    EmailAlreadyTakenError,
    InvalidCodeError,
    SameEmailError,
    TooManyCodesError,
)
from app.auth.services.repo import SessionRepository
from app.auth.services.usecases.change_email import (
    ConfirmEmailChangeUseCase,
    RequestEmailChangeUseCase,
)
from app.auth.services.usecases.login import LoginUseCase
from app.auth.services.usecases.send_code import SendCodeUseCase
from app.auth.services.validators import wait_message
from app.core.config import get_settings
from app.core.mail import MailError
from app.users.models import User
from app.users.schemas import UserSchema
from app.users.services.validators import normalize_email

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/code", status_code=status.HTTP_202_ACCEPTED)
async def send_login_code(
    payload: CodeRequestSchema,
    usecase: SendCodeUseCase = Depends(get_send_code_usecase),
) -> CodeSentSchema:
    """Отправить код для входа. Есть ли аккаунт с этим email, ответ не раскрывает."""

    try:
        await usecase.execute(normalize_email(payload.email), CodePurpose.LOGIN)
    except TooManyCodesError as error:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=wait_message(error.retry_after),
            headers={"Retry-After": str(error.retry_after)},
        ) from error
    except MailError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Не удалось отправить письмо. Попробуйте позже",
        ) from error

    settings = get_settings()

    return CodeSentSchema(
        resend_after=settings.code_resend_seconds,
        expires_in=settings.code_expires_minutes * 60,
    )


@router.post("/login")
async def login(
    payload: LoginSchema,
    response: Response,
    usecase: LoginUseCase = Depends(get_login_usecase),
) -> UserSchema:
    """Вход по коду. Первый вход создаёт аккаунт: у нового пользователя пустое имя."""

    try:
        user, token = await usecase.execute(payload)
    except InvalidCodeError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Неверный код. Осталось попыток: {error.attempts_left}",
        ) from error
    except CodeExpiredError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error

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
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Это ваш текущий адрес",
        ) from error
    except EmailAlreadyTakenError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="На этот email уже есть аккаунт",
        ) from error
    except TooManyCodesError as error:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=wait_message(error.retry_after),
            headers={"Retry-After": str(error.retry_after)},
        ) from error
    except MailError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Не удалось отправить письмо. Попробуйте позже",
        ) from error

    settings = get_settings()

    return CodeSentSchema(
        resend_after=settings.code_resend_seconds,
        expires_in=settings.code_expires_minutes * 60,
    )


@router.post("/email/confirm")
async def confirm_email_change(
    payload: CodeConfirmSchema,
    user: User = Depends(require_user),
    usecase: ConfirmEmailChangeUseCase = Depends(get_confirm_email_change_usecase),
) -> UserSchema:
    """Подтвердить новую почту кодом из письма."""

    try:
        updated = await usecase.execute(user, payload)
    except InvalidCodeError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Неверный код. Осталось попыток: {error.attempts_left}",
        ) from error
    except CodeExpiredError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error
    except EmailAlreadyTakenError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="На этот email уже есть аккаунт",
        ) from error

    return UserSchema.model_validate(updated)
