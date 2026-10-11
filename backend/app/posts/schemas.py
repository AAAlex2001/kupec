from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Self

from pydantic import BaseModel, ConfigDict, Field

from app.listings.models import ListingStatus
from app.posts.models import (
    MAX_AI_INSTRUCTION,
    MAX_COMMENT_LENGTH,
    MAX_POST_HTML,
    MAX_POST_LISTINGS,
    MAX_POST_MEDIA,
    MAX_REPORT_LENGTH,
    MediaKind,
    Post,
    PostComment,
    PostStatus,
    ReportStatus,
)


@dataclass
class ViewerMarks:
    """Отметки того, кто смотрит: какие посты лайкнул и сохранил, на каких авторов подписан."""

    liked: set[int] = field(default_factory=set)
    saved: set[int] = field(default_factory=set)
    following: set[int] = field(default_factory=set)


class PostSaveSchema(BaseModel):
    """Текст, файлы и объявления поста при публикации и правке."""

    html: str = Field("", max_length=MAX_POST_HTML, description="Текст из редактора в HTML")
    media_ids: list[int] = Field([], max_length=MAX_POST_MEDIA, description="Фото и видео по порядку")
    listing_ids: list[int] = Field(
        [], max_length=MAX_POST_LISTINGS, description="Свои объявления в посте"
    )
    draft: bool = Field(False, description="Сохранить черновиком, не публикуя")
    telegram: bool = Field(False, description="Опубликовать также в свой Telegram-канал. Только для нового поста")


class PostMediaSchema(BaseModel):
    """Фото или видео к посту."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID файла")
    kind: MediaKind = Field(..., description="Фото или видео")
    url: str = Field(..., description="Адрес файла")


class PostAuthorSchema(BaseModel):
    """Автор поста."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID пользователя")
    name: str | None = Field(None, description="Имя")
    avatar_url: str | None = Field(None, description="Адрес аватара")


class PostCategorySchema(BaseModel):
    """Категория прикреплённого объявления."""

    model_config = ConfigDict(from_attributes=True)

    name: str = Field(..., description="Название")


class PostListingSchema(BaseModel):
    """Объявление, прикреплённое к посту."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID объявления")
    title: str = Field(..., description="Название")
    price: Decimal | None = Field(None, description="Цена")
    unit_label: str | None = Field(None, description="Единица цены")
    cover_url: str | None = Field(None, description="Адрес обложки")
    status: ListingStatus = Field(..., description="Состояние объявления")
    category: PostCategorySchema | None = Field(None, description="Категория")


class RepostSaveSchema(BaseModel):
    """Репост: без текста или с комментарием из редактора."""

    html: str = Field("", max_length=MAX_POST_HTML, description="Комментарий к репосту в HTML")


class OriginalPostSchema(BaseModel):
    """Публикация, которую репостнули: показывается внутри репоста."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID поста")
    author: PostAuthorSchema = Field(..., description="Автор")
    html: str = Field(..., description="Очищенный текст в HTML")
    media: list[PostMediaSchema] = Field(..., description="Фото и видео")
    listings: list[PostListingSchema] = Field(..., description="Прикреплённые объявления")
    created_at: datetime = Field(..., description="Когда создан")
    published_at: datetime | None = Field(None, description="Когда опубликован")


class PostSchema(BaseModel):
    """Пост целиком. liked и saved — для того, кто смотрит. У репоста — оригинал в repost_of."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID поста")
    author: PostAuthorSchema = Field(..., description="Автор")
    html: str = Field(..., description="Очищенный текст в HTML")
    media: list[PostMediaSchema] = Field(..., description="Фото и видео")
    listings: list[PostListingSchema] = Field(..., description="Прикреплённые объявления")
    repost_of: OriginalPostSchema | None = Field(None, description="Оригинал, если это репост")
    status: PostStatus = Field(..., description="Черновик, опубликован или скрыт")
    likes_count: int = Field(..., description="Сколько лайков")
    comments_count: int = Field(..., description="Сколько комментариев")
    reposts_count: int = Field(..., description="Сколько репостов")
    views_count: int = Field(..., description="Сколько раз смотрели")
    liked: bool = Field(False, description="Вы поставили лайк")
    saved: bool = Field(False, description="Пост у вас в сохранённом")
    following: bool = Field(False, description="Вы подписаны на автора")
    created_at: datetime = Field(..., description="Когда создан")
    published_at: datetime | None = Field(None, description="Когда опубликован")

    @classmethod
    def for_viewer(cls, post: Post, marks: ViewerMarks) -> Self:
        """Пост с отметками того, кто смотрит."""

        return cls.model_validate(post).model_copy(
            update={
                "liked": post.id in marks.liked,
                "saved": post.id in marks.saved,
                "following": post.author_id in marks.following,
            }
        )


class PostPageSchema(BaseModel):
    """Страница постов и сколько их всего."""

    items: list[PostSchema]
    total: int = Field(..., description="Сколько постов всего")

    @classmethod
    def for_viewer(cls, posts: list[Post], total: int, marks: ViewerMarks) -> Self:
        """Страница постов с отметками того, кто смотрит."""

        return cls(items=[PostSchema.for_viewer(post, marks) for post in posts], total=total)


class UnseenSchema(BaseModel):
    """Сколько новых постов в подписках с прошлого захода во вкладку."""

    count: int = Field(..., description="Новых постов")


class PostCountsSchema(BaseModel):
    """Сколько своих постов в каждом состоянии. Репосты не считаются."""

    published: int = Field(0, description="Опубликованные")
    draft: int = Field(0, description="Черновики")
    hidden: int = Field(0, description="Скрытые")


class LikesSchema(BaseModel):
    """Лайки поста или комментария после нажатия."""

    likes_count: int = Field(..., description="Сколько лайков")
    liked: bool = Field(..., description="Вы поставили лайк")


class CommentSaveSchema(BaseModel):
    """Новый комментарий или ответ на комментарий."""

    text: str = Field(..., min_length=1, max_length=MAX_COMMENT_LENGTH, description="Текст")
    reply_to_id: int | None = Field(None, description="На какой комментарий ответ")


class CommentEditSchema(BaseModel):
    """Новый текст своего комментария."""

    text: str = Field(..., min_length=1, max_length=MAX_COMMENT_LENGTH, description="Текст")


class CommentSchema(BaseModel):
    """Комментарий к посту. parent_id — корень ветки, пусто у корневого."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID комментария")
    author: PostAuthorSchema = Field(..., description="Автор")
    text: str = Field(..., description="Текст")
    parent_id: int | None = Field(None, description="Корень ветки")
    reply_to_name: str | None = Field(None, description="Кому ответ")
    likes_count: int = Field(..., description="Сколько лайков")
    liked: bool = Field(False, description="Вы поставили лайк")
    created_at: datetime = Field(..., description="Когда написан")

    @classmethod
    def for_viewer(cls, comment: PostComment, liked: set[int]) -> Self:
        """Комментарий с отметкой лайка того, кто смотрит."""

        return cls.model_validate(comment).model_copy(update={"liked": comment.id in liked})


class CommentThreadSchema(BaseModel):
    """Ветка: корневой комментарий и ответы в ней по порядку."""

    comment: CommentSchema
    replies: list[CommentSchema]


class CommentThreadPageSchema(BaseModel):
    """Страница веток комментариев, сколько веток всего и сколько комментариев у поста."""

    items: list[CommentThreadSchema]
    total: int = Field(..., description="Сколько веток всего")
    comments_count: int = Field(..., description="Сколько комментариев у поста вместе с ответами")


class AssistantRequestSchema(BaseModel):
    """Просьба к ИИ-помощнику и текущий текст поста."""

    instruction: str = Field(
        ..., min_length=2, max_length=MAX_AI_INSTRUCTION, description="Что сделать с текстом"
    )
    html: str = Field("", max_length=MAX_POST_HTML, description="Текущий текст поста в HTML")


class AssistantAnswerSchema(BaseModel):
    """Текст поста от ИИ-помощника — только теги редактора."""

    html: str = Field(..., description="Готовый текст в HTML")


class ReportSaveSchema(BaseModel):
    """Жалоба: что не так."""

    reason: str = Field(..., min_length=3, max_length=MAX_REPORT_LENGTH, description="Причина")


class ReportSchema(BaseModel):
    """Жалоба для модератора: кто, на что и почему."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID жалобы")
    reporter: PostAuthorSchema = Field(..., description="Кто пожаловался")
    post: PostSchema | None = Field(None, description="Пост, если жалоба на пост")
    comment: CommentSchema | None = Field(None, description="Комментарий, если жалоба на комментарий")
    reason: str = Field(..., description="Причина")
    status: ReportStatus = Field(..., description="Ждёт модератора или рассмотрена")
    created_at: datetime = Field(..., description="Когда")
