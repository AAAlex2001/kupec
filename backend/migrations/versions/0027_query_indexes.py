"""query indexes

Индексы под реальные запросы: ленты публикаций и объявлений, комментарии, уведомления,
сообщения, отзывы и списки админки. Одиночные индексы, которые теперь покрывает первое поле
составного, удаляются. Внешние ключи с каскадным удалением получают свои индексы.

Revision ID: 0027
Revises: 0026
Create Date: 2026-10-11
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0027"
down_revision: Union[str, None] = "0026"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

PUBLISHED = sa.text("status = 'published'")
POST_ORDER = sa.text("coalesce(published_at, created_at) DESC")


def upgrade() -> None:
    op.create_index(
        "ix_posts_feed", "posts", [POST_ORDER, sa.text("id DESC")], postgresql_where=PUBLISHED
    )
    op.create_index(
        "ix_posts_author_feed", "posts", ["author_id", POST_ORDER, sa.text("id DESC")]
    )
    op.drop_index("ix_posts_author_id", table_name="posts")

    op.create_index(
        "ix_post_comments_roots",
        "post_comments",
        ["post_id", "created_at", "id"],
        postgresql_where=sa.text("parent_id IS NULL"),
    )
    op.create_index(
        "ix_post_comments_replies", "post_comments", ["parent_id", "created_at", "id"]
    )
    op.drop_index("ix_post_comments_parent_id", table_name="post_comments")
    op.create_index("ix_post_comments_reply_to_id", "post_comments", ["reply_to_id"])

    op.create_index(
        "ix_notifications_user_feed",
        "notifications",
        ["user_id", sa.text("created_at DESC"), sa.text("id DESC")],
    )
    op.create_index(
        "ix_notifications_unread",
        "notifications",
        ["user_id"],
        postgresql_where=sa.text("read IS false"),
    )
    op.create_index(
        "ix_notifications_dedupe", "notifications", ["user_id", "actor_id", "kind"]
    )
    op.drop_index("ix_notifications_user_id", table_name="notifications")
    op.create_index("ix_notifications_actor_id", "notifications", ["actor_id"])
    op.create_index("ix_notifications_post_id", "notifications", ["post_id"])
    op.create_index("ix_notifications_comment_id", "notifications", ["comment_id"])

    op.create_index(
        "ix_messages_conversation_feed", "messages", ["conversation_id", "created_at", "id"]
    )
    op.drop_index("ix_messages_conversation_id", table_name="messages")
    op.create_index("ix_messages_sender_id", "messages", ["sender_id"])

    op.create_index(
        "ix_listings_category_feed",
        "listings",
        ["category_id", sa.text("published_at DESC"), sa.text("id DESC")],
        postgresql_where=PUBLISHED,
    )
    op.create_index(
        "ix_listings_city_feed",
        "listings",
        ["city_id", sa.text("published_at DESC"), sa.text("id DESC")],
        postgresql_where=PUBLISHED,
    )
    op.create_index(
        "ix_listings_owner_updated",
        "listings",
        ["owner_id", "status", sa.text("updated_at DESC"), sa.text("id DESC")],
    )
    op.create_index(
        "ix_listings_status_updated",
        "listings",
        ["status", sa.text("updated_at DESC"), sa.text("id DESC")],
    )
    op.drop_index("ix_listings_owner_id", table_name="listings")
    op.drop_index("ix_listings_status", table_name="listings")

    op.create_index(
        "ix_reviews_seller_published",
        "reviews",
        ["seller_id", sa.text("created_at DESC"), sa.text("id DESC")],
        postgresql_where=PUBLISHED,
    )
    op.create_index("ix_reviews_status_updated", "reviews", ["status", "updated_at", "id"])
    op.drop_index("ix_reviews_status", table_name="reviews")

    op.create_index(
        "ix_users_created_at", "users", [sa.text("created_at DESC"), sa.text("id DESC")]
    )


def downgrade() -> None:
    op.drop_index("ix_users_created_at", table_name="users")

    op.create_index("ix_reviews_status", "reviews", ["status"])
    op.drop_index("ix_reviews_status_updated", table_name="reviews")
    op.drop_index("ix_reviews_seller_published", table_name="reviews")

    op.create_index("ix_listings_status", "listings", ["status"])
    op.create_index("ix_listings_owner_id", "listings", ["owner_id"])
    op.drop_index("ix_listings_status_updated", table_name="listings")
    op.drop_index("ix_listings_owner_updated", table_name="listings")
    op.drop_index("ix_listings_city_feed", table_name="listings")
    op.drop_index("ix_listings_category_feed", table_name="listings")

    op.drop_index("ix_messages_sender_id", table_name="messages")
    op.create_index("ix_messages_conversation_id", "messages", ["conversation_id"])
    op.drop_index("ix_messages_conversation_feed", table_name="messages")

    op.drop_index("ix_notifications_comment_id", table_name="notifications")
    op.drop_index("ix_notifications_post_id", table_name="notifications")
    op.drop_index("ix_notifications_actor_id", table_name="notifications")
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])
    op.drop_index("ix_notifications_dedupe", table_name="notifications")
    op.drop_index("ix_notifications_unread", table_name="notifications")
    op.drop_index("ix_notifications_user_feed", table_name="notifications")

    op.drop_index("ix_post_comments_reply_to_id", table_name="post_comments")
    op.create_index("ix_post_comments_parent_id", "post_comments", ["parent_id"])
    op.drop_index("ix_post_comments_replies", table_name="post_comments")
    op.drop_index("ix_post_comments_roots", table_name="post_comments")

    op.create_index("ix_posts_author_id", "posts", ["author_id"])
    op.drop_index("ix_posts_author_feed", table_name="posts")
    op.drop_index("ix_posts_feed", table_name="posts")
