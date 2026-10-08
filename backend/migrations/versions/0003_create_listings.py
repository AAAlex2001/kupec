"""create categories, listings and listing photos

Категории заливаются сразу: товары и услуги для старта площадки.

Revision ID: 0003
Revises: 0002
Create Date: 2026-10-08
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

CATEGORIES = [
    ("product", "pickles", "Соленья"),
    ("product", "mushrooms", "Грибы"),
    ("product", "berries", "Ягоды"),
    ("product", "vegetables", "Овощи и фрукты"),
    ("product", "honey", "Мёд"),
    ("product", "bakery", "Домашняя выпечка"),
    ("product", "dairy", "Молочная продукция"),
    ("product", "meat-fish", "Мясо и рыба"),
    ("product", "clothes", "Одежда и обувь"),
    ("product", "kids", "Детские товары"),
    ("product", "electronics", "Электроника"),
    ("product", "furniture", "Мебель и интерьер"),
    ("product", "auto-parts", "Авто и запчасти"),
    ("product", "hobby", "Хобби и спорт"),
    ("product", "other-goods", "Другие товары"),
    ("service", "massage", "Массаж"),
    ("service", "tutors", "Репетиторы"),
    ("service", "beauty", "Красота"),
    ("service", "renovation", "Ремонт и отделка"),
    ("service", "car-repair", "Ремонт авто"),
    ("service", "cleaning", "Уборка"),
    ("service", "moving", "Грузоперевозки"),
    ("service", "computer-help", "Компьютерная помощь"),
    ("service", "photo-video", "Фото и видео"),
    ("service", "other-services", "Другие услуги"),
]


def upgrade() -> None:
    categories = op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("kind", sa.String(length=16), nullable=False),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
        sa.CheckConstraint("kind IN ('product', 'service')", name="ck_categories_kind"),
    )

    op.bulk_insert(
        categories,
        [
            {"kind": kind, "slug": slug, "name": name, "sort_order": index}
            for index, (kind, slug, name) in enumerate(CATEGORIES)
        ],
    )

    op.create_table(
        "listings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("kind", sa.String(length=16), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("price", sa.Numeric(12, 2), nullable=True),
        sa.Column("unit", sa.String(length=16), nullable=True),
        sa.Column("city_id", sa.Integer(), nullable=True),
        sa.Column(
            "service_places",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column("schedule", sa.String(length=200), nullable=True),
        sa.Column("contact_phone", sa.String(length=32), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["city_id"], ["cities.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("kind IN ('product', 'service')", name="ck_listings_kind"),
        sa.CheckConstraint(
            "status IN ('draft', 'published', 'archived')", name="ck_listings_status"
        ),
        sa.CheckConstraint("price IS NULL OR price >= 0", name="ck_listings_price"),
    )
    op.create_index("ix_listings_owner_id", "listings", ["owner_id"])
    op.create_index("ix_listings_status", "listings", ["status"])
    op.create_index("ix_listings_category_id", "listings", ["category_id"])
    op.create_index("ix_listings_city_id", "listings", ["city_id"])

    op.create_table(
        "listing_photos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("listing_id", sa.Integer(), nullable=True),
        sa.Column("path", sa.String(length=500), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["listing_id"], ["listings.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_listing_photos_owner_id", "listing_photos", ["owner_id"])
    op.create_index("ix_listing_photos_listing_id", "listing_photos", ["listing_id"])


def downgrade() -> None:
    op.drop_table("listing_photos")
    op.drop_table("listings")
    op.drop_table("categories")
