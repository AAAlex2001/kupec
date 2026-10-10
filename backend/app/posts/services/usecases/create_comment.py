"""Сценарий нового комментария или ответа."""

from app.notifications.models import Notification, NotificationKind
from app.notifications.services.usecases.notify import NotifyUseCase
from app.posts.models import Post, PostComment
from app.posts.schemas import CommentSaveSchema
from app.posts.services.comment_repo import PostCommentRepository
from app.posts.services.exceptions import CommentNotFoundError
from app.users.models import User


class CreateCommentUseCase:
    """Написать комментарий к посту. Ответ попадает в ветку того комментария, на который отвечают.

    Автору поста приходит уведомление о комментарии, автору комментария — об ответе.
    """

    def __init__(self, comments: PostCommentRepository, notify: NotifyUseCase) -> None:
        self.comments = comments
        self.notify = notify

    async def thread_of(self, post: Post, reply_to_id: int | None) -> int | None:
        """Корень ветки для ответа. Корневой комментарий — None. Чужой пост — CommentNotFoundError."""

        if reply_to_id is None:
            return None

        reply_to = await self.comments.get_by_id(reply_to_id)
        if reply_to is None or reply_to.post_id != post.id:
            raise CommentNotFoundError("Комментарий не найден")

        return reply_to.parent_id or reply_to.id

    def notification(self, post: Post, comment: PostComment) -> Notification:
        """Кому сообщить: автору комментария, на который ответили, иначе автору поста."""

        if comment.reply_to is not None:
            return Notification(
                user_id=comment.reply_to.author_id,
                actor_id=comment.author_id,
                kind=NotificationKind.REPLY,
                post_id=post.id,
                comment_id=comment.id,
            )

        return Notification(
            user_id=post.author_id,
            actor_id=comment.author_id,
            kind=NotificationKind.COMMENT,
            post_id=post.id,
            comment_id=comment.id,
        )

    async def execute(self, user: User, post: Post, payload: CommentSaveSchema) -> PostComment:
        """Вернуть новый комментарий."""

        comment = PostComment(
            post_id=post.id,
            author_id=user.id,
            parent_id=await self.thread_of(post, payload.reply_to_id),
            reply_to_id=payload.reply_to_id,
            text=payload.text.strip(),
        )

        created = await self.comments.add(comment)
        await self.notify.execute(self.notification(post, created))

        return created
