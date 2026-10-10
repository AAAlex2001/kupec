from datetime import datetime
from enum import StrEnum

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.users.models import User


class NotificationKind(StrEnum):
    """О чём уведомление."""

    COMMENT = "comment"
    REPLY = "reply"
    LIKE = "like"
    REPOST = "repost"
    FOLLOW = "follow"


class Notification(Base):
    """Уведомление пользователю: кто-то прокомментировал, ответил, лайкнул, репостнул или подписался."""

    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    actor_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    kind: Mapped[str] = mapped_column(String(16))
    post_id: Mapped[int | None] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"))
    comment_id: Mapped[int | None] = mapped_column(
        ForeignKey("post_comments.id", ondelete="CASCADE")
    )
    read: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    actor: Mapped[User] = relationship(foreign_keys=[actor_id], lazy="joined")

    __table_args__ = (
        CheckConstraint(
            "kind IN ('comment', 'reply', 'like', 'repost', 'follow')",
            name="ck_notifications_kind",
        ),
    )
