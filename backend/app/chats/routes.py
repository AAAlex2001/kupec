from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth.dependencies import require_user
from app.chats.dependencies import (
    get_block_repository,
    get_block_usecase,
    get_conversation_repository,
    get_open_conversation_usecase,
    get_own_conversation,
    get_send_message_usecase,
    get_start_conversation_usecase,
    get_unblock_usecase,
)
from app.chats.models import Conversation
from app.chats.schemas import (
    ConversationDetailSchema,
    ConversationSchema,
    ConversationStartSchema,
    MessageCreateSchema,
    MessageSchema,
    UnreadSchema,
)
from app.chats.services.exceptions import BlockedError, EmptyMessageError, OwnListingError
from app.chats.services.repo import BlockRepository, ConversationRepository
from app.chats.services.usecases.manage_block import BlockUserUseCase, UnblockUserUseCase
from app.chats.services.usecases.open_conversation import OpenConversationUseCase
from app.chats.services.usecases.send_message import SendMessageUseCase
from app.chats.services.usecases.start_conversation import StartConversationUseCase
from app.listings.services.exceptions import ListingNotFoundError
from app.users.models import User

router = APIRouter(prefix="/conversations", tags=["chats"])


@router.get("")
async def list_conversations(
    q: str | None = Query(None, max_length=100, description="Поиск по объявлению или имени"),
    user: User = Depends(require_user),
    conversations: ConversationRepository = Depends(get_conversation_repository),
) -> list[ConversationSchema]:
    """Переписки пользователя, свежие первыми."""

    items = await conversations.list_for_user(user.id, q.strip() if q else None)

    return [ConversationSchema.for_user(item, user.id) for item in items]


@router.get("/unread")
async def count_unread(
    user: User = Depends(require_user),
    conversations: ConversationRepository = Depends(get_conversation_repository),
) -> UnreadSchema:
    """Сколько непрочитанных сообщений во всех переписках."""

    return UnreadSchema(count=await conversations.count_unread(user.id))


@router.post("")
async def start_conversation(
    payload: ConversationStartSchema,
    user: User = Depends(require_user),
    usecase: StartConversationUseCase = Depends(get_start_conversation_usecase),
) -> ConversationSchema:
    """«Написать» по объявлению: новая переписка или уже начатая."""

    try:
        conversation = await usecase.execute(user, payload.listing_id)
    except ListingNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error
    except OwnListingError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error

    return ConversationSchema.for_user(conversation, user.id)


@router.get("/{conversation_id}")
async def open_conversation(
    user: User = Depends(require_user),
    conversation: Conversation = Depends(get_own_conversation),
    usecase: OpenConversationUseCase = Depends(get_open_conversation_usecase),
    blocks: BlockRepository = Depends(get_block_repository),
) -> ConversationDetailSchema:
    """Переписка со всеми сообщениями и блокировками. Входящие отмечаются прочитанными."""

    conversation, messages = await usecase.execute(user, conversation)
    companion_id = conversation.companion(user.id).id

    return ConversationDetailSchema(
        conversation=ConversationSchema.for_user(conversation, user.id),
        messages=[MessageSchema.model_validate(message) for message in messages],
        blocked_by_me=await blocks.get(user.id, companion_id) is not None,
        blocked_me=await blocks.get(companion_id, user.id) is not None,
    )


@router.put("/{conversation_id}/block", status_code=status.HTTP_204_NO_CONTENT)
async def block_companion(
    user: User = Depends(require_user),
    conversation: Conversation = Depends(get_own_conversation),
    usecase: BlockUserUseCase = Depends(get_block_usecase),
) -> None:
    """Заблокировать собеседника: он больше не сможет писать."""

    await usecase.execute(user, conversation)


@router.delete("/{conversation_id}/block", status_code=status.HTTP_204_NO_CONTENT)
async def unblock_companion(
    user: User = Depends(require_user),
    conversation: Conversation = Depends(get_own_conversation),
    usecase: UnblockUserUseCase = Depends(get_unblock_usecase),
) -> None:
    """Снять блокировку с собеседника."""

    await usecase.execute(user, conversation)


@router.post("/{conversation_id}/messages", status_code=status.HTTP_201_CREATED)
async def send_message(
    payload: MessageCreateSchema,
    user: User = Depends(require_user),
    conversation: Conversation = Depends(get_own_conversation),
    usecase: SendMessageUseCase = Depends(get_send_message_usecase),
) -> MessageSchema:
    """Отправить сообщение собеседнику."""

    try:
        message = await usecase.execute(user, conversation, payload.text)
    except EmptyMessageError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error
    except BlockedError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(error),
        ) from error

    return MessageSchema.model_validate(message)
