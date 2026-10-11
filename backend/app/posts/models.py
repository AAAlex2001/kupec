from datetime import date, datetime
from enum import StrEnum

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.uploads import media_url
from app.listings.models import Listing
from app.users.models import User

MAX_POST_MEDIA = 10
MAX_POST_LISTINGS = 5
MAX_POST_HTML = 30000
MAX_COMMENT_LENGTH = 2000
MAX_REPORT_LENGTH = 500
MAX_AI_INSTRUCTION = 1000

PUBLISHED_ONLY = text("status = 'published'")
ROOTS_ONLY = text("parent_id IS NULL")


class ReportStatus(StrEnum):
    """Жалоба ждёт модератора или уже рассмотрена."""

    OPEN = "open"
    RESOLVED = "resolved"


class PostStatus(StrEnum):
    """Состояние публикации. Читателям виден только опубликованный пост."""

    DRAFT = "draft"
    PUBLISHED = "published"
    HIDDEN = "hidden"


class MediaKind(StrEnum):
    """Что загружено к посту: фото или видео."""

    PHOTO = "photo"
    VIDEO = "video"


class Post(Base):
    """Публикация пользователя: текст из редактора, фото и видео.

    Репост — тот же пост со ссылкой на оригинал: без текста или с комментарием в html.
    """

    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    repost_of_id: Mapped[int | None] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"), index=True
    )

    html: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(16), default=PostStatus.DRAFT, index=True)
    likes_count: Mapped[int] = mapped_column(Integer, default=0)
    comments_count: Mapped[int] = mapped_column(Integer, default=0)
    reposts_count: Mapped[int] = mapped_column(Integer, default=0)
    views_count: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    author: Mapped[User] = relationship(lazy="joined")
    media: Mapped[list["PostMedia"]] = relationship(
        back_populates="post",
        lazy="selectin",
        order_by="PostMedia.sort_order, PostMedia.id",
        cascade="all, delete-orphan",
    )
    listings: Mapped[list[Listing]] = relationship(
        secondary="post_listings", lazy="selectin", order_by=Listing.id
    )
    repost_of: Mapped["Post | None"] = relationship(
        remote_side=[id], foreign_keys=[repost_of_id], lazy="joined", join_depth=1
    )

    __table_args__ = (
        CheckConstraint("status IN ('draft', 'published', 'hidden')", name="ck_posts_status"),
        Index(
            "ix_posts_feed",
            func.coalesce(published_at, created_at).desc(),
            id.desc(),
            postgresql_where=PUBLISHED_ONLY,
        ),
        Index(
            "ix_posts_author_feed",
            author_id,
            func.coalesce(published_at, created_at).desc(),
            id.desc(),
        ),
    )


class PostListing(Base):
    """Своё объявление, прикреплённое к посту."""

    __tablename__ = "post_listings"

    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True
    )
    listing_id: Mapped[int] = mapped_column(
        ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True, index=True
    )


class PostLike(Base):
    """Лайк поста. Пара пользователь–пост уникальна."""

    __tablename__ = "post_likes"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True, index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class PostView(Base):
    """Просмотр поста посетителем за день. Один посетитель — один просмотр в сутки."""

    __tablename__ = "post_views"

    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True
    )
    visitor: Mapped[str] = mapped_column(String(64), primary_key=True)
    viewed_on: Mapped[date] = mapped_column(Date, primary_key=True)


class PostSave(Base):
    """Пост в «Сохранённом» у пользователя. Пара пользователь–пост уникальна."""

    __tablename__ = "post_saves"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True, index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class PostComment(Base):
    """Комментарий к посту или к статье блога и новостей — ровно к чему-то одному.

    Ответы собираются в ветку под корневым комментарием: parent_id — корень ветки,
    reply_to_id — комментарий, на который отвечают.
    """

    __tablename__ = "post_comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    post_id: Mapped[int | None] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"), index=True
    )
    article_id: Mapped[int | None] = mapped_column(
        ForeignKey("articles.id", ondelete="CASCADE"), index=True
    )
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("post_comments.id", ondelete="CASCADE")
    )
    reply_to_id: Mapped[int | None] = mapped_column(
        ForeignKey("post_comments.id", ondelete="SET NULL"), index=True
    )

    text: Mapped[str] = mapped_column(Text)
    likes_count: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    author: Mapped[User] = relationship(lazy="joined")
    reply_to: Mapped["PostComment | None"] = relationship(
        remote_side=[id], foreign_keys=[reply_to_id], lazy="joined", join_depth=1
    )

    __table_args__ = (
        CheckConstraint(
            "(post_id IS NULL) <> (article_id IS NULL)", name="ck_post_comments_target"
        ),
        Index(
            "ix_post_comments_roots",
            post_id,
            created_at,
            id,
            postgresql_where=ROOTS_ONLY,
        ),
        Index(
            "ix_post_comments_article_roots",
            article_id,
            created_at,
            id,
            postgresql_where=ROOTS_ONLY,
        ),
        Index("ix_post_comments_replies", parent_id, created_at, id),
    )

    @property
    def reply_to_name(self) -> str | None:
        """Кому ответ: имя автора комментария, на который отвечают."""

        return self.reply_to.author.name if self.reply_to else None


class CommentLike(Base):
    """Лайк комментария. Пара пользователь–комментарий уникальна."""

    __tablename__ = "comment_likes"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    comment_id: Mapped[int] = mapped_column(
        ForeignKey("post_comments.id", ondelete="CASCADE"), primary_key=True, index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class PostMedia(Base):
    """Фото или видео к посту. Загружается до публикации, к посту привязывается при сохранении."""

    __tablename__ = "post_media"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    post_id: Mapped[int | None] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"), index=True
    )

    kind: Mapped[str] = mapped_column(String(16))
    path: Mapped[str] = mapped_column(String(500))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    post: Mapped[Post | None] = relationship(back_populates="media")

    __table_args__ = (
        CheckConstraint("kind IN ('photo', 'video')", name="ck_post_media_kind"),
    )

    @property
    def url(self) -> str | None:
        """Адрес файла для сайта."""

        return media_url(self.path)


class PostReport(Base):
    """Жалоба на пост или комментарий. Модератор скрывает пост, удаляет комментарий или отклоняет жалобу."""

    __tablename__ = "post_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    reporter_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    post_id: Mapped[int | None] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"), index=True
    )
    comment_id: Mapped[int | None] = mapped_column(
        ForeignKey("post_comments.id", ondelete="CASCADE"), index=True
    )

    reason: Mapped[str] = mapped_column(String(MAX_REPORT_LENGTH))
    status: Mapped[str] = mapped_column(String(16), default=ReportStatus.OPEN, index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    reporter: Mapped[User] = relationship(lazy="joined")
    post: Mapped[Post | None] = relationship(lazy="joined")
    comment: Mapped[PostComment | None] = relationship(lazy="joined")

    __table_args__ = (
        CheckConstraint("status IN ('open', 'resolved')", name="ck_post_reports_status"),
    )


class AiRequest(Base):
    """Запрос к ИИ-помощнику постов. Хранится только время — для лимита запросов в час."""

    __tablename__ = "ai_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    __table_args__ = (Index("ix_ai_requests_user_created", user_id, created_at),)
