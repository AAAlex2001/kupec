"""Тесты уведомлений без БД: кому и когда приходят."""

import asyncio

from app.notifications.models import Notification, NotificationKind
from app.notifications.services.usecases.notify import NotifyUseCase
from app.posts.models import Post, PostComment
from app.posts.schemas import CommentSaveSchema
from app.posts.services.usecases.create_comment import CreateCommentUseCase
from app.users.models import User
from tests.fakes import FakeNotify

POST_AUTHOR = User(id=1, email="anna@mail.ru", name="Анна")
READER = User(id=2, email="oleg@mail.ru", name="Олег")
POST = Post(id=10, author_id=POST_AUTHOR.id)


class FakeNotificationRepository:
    def __init__(self) -> None:
        self.items: list[Notification] = []

    async def exists(self, notification: Notification) -> bool:
        return any(
            item.user_id == notification.user_id
            and item.actor_id == notification.actor_id
            and item.kind == notification.kind
            and item.post_id == notification.post_id
            for item in self.items
        )

    async def add(self, notification: Notification) -> None:
        self.items.append(notification)


def like(notifications: FakeNotificationRepository, actor: User) -> None:
    notification = Notification(
        user_id=POST.author_id, actor_id=actor.id, kind=NotificationKind.LIKE, post_id=POST.id
    )
    asyncio.run(NotifyUseCase(notifications).execute(notification))


def test_no_notification_about_own_action_or_repeat() -> None:
    notifications = FakeNotificationRepository()

    like(notifications, POST_AUTHOR)
    assert notifications.items == []

    like(notifications, READER)
    like(notifications, READER)
    assert len(notifications.items) == 1


class FakeCommentRepository:
    """Отдаёт сохранённый комментарий с тем, кому ответ."""

    def __init__(self, reply_to: PostComment | None) -> None:
        self.reply_to = reply_to

    async def get_by_id(self, comment_id: int) -> PostComment | None:
        return self.reply_to

    async def add(self, comment: PostComment) -> PostComment:
        comment.id = 99
        comment.reply_to = self.reply_to

        return comment


def comment(reply_to: PostComment | None) -> Notification:
    notify = FakeNotify()
    usecase = CreateCommentUseCase(FakeCommentRepository(reply_to), notify)
    payload = CommentSaveSchema(text="Спасибо", reply_to_id=reply_to.id if reply_to else None)
    asyncio.run(usecase.execute(READER, POST, payload))

    return notify.sent[0]


def test_comment_notifies_post_author_and_reply_notifies_comment_author() -> None:
    assert comment(None).user_id == POST_AUTHOR.id
    assert comment(None).kind == NotificationKind.COMMENT

    root = PostComment(id=5, post_id=POST.id, author_id=3)
    reply = comment(root)
    assert reply.user_id == 3
    assert reply.kind == NotificationKind.REPLY
