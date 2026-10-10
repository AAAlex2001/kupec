"""Сценарий комментария к статье или ответа в обсуждении."""

from app.articles.models import Article
from app.notifications.models import Notification, NotificationKind
from app.notifications.services.usecases.notify import NotifyUseCase
from app.posts.models import PostComment
from app.posts.schemas import CommentSaveSchema
from app.posts.services.comment_repo import PostCommentRepository
from app.posts.services.exceptions import CommentNotFoundError
from app.users.models import User


class CreateArticleCommentUseCase:
    """Написать комментарий к статье. Ответ попадает в ветку того комментария, на который отвечают.

    У статьи нет автора-пользователя, поэтому уведомление приходит только тому, кому ответили.
    """

    def __init__(self, comments: PostCommentRepository, notify: NotifyUseCase) -> None:
        self.comments = comments
        self.notify = notify

    async def thread_of(self, article: Article, reply_to_id: int | None) -> int | None:
        """Корень ветки для ответа. Корневой комментарий — None. Из другой статьи — CommentNotFoundError."""

        if reply_to_id is None:
            return None

        reply_to = await self.comments.get_by_id(reply_to_id)
        if reply_to is None or reply_to.article_id != article.id:
            raise CommentNotFoundError("Комментарий не найден")

        return reply_to.parent_id or reply_to.id

    async def execute(
        self, user: User, article: Article, payload: CommentSaveSchema
    ) -> PostComment:
        """Вернуть новый комментарий."""

        comment = PostComment(
            article_id=article.id,
            author_id=user.id,
            parent_id=await self.thread_of(article, payload.reply_to_id),
            reply_to_id=payload.reply_to_id,
            text=payload.text.strip(),
        )

        created = await self.comments.add(comment)

        if created.reply_to is not None:
            await self.notify.execute(
                Notification(
                    user_id=created.reply_to.author_id,
                    actor_id=created.author_id,
                    kind=NotificationKind.REPLY,
                    article_id=article.id,
                    comment_id=created.id,
                )
            )

        return created
