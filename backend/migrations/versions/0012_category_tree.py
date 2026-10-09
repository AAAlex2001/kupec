"""category tree and feed index

Категории становятся деревом: у категории может быть родитель.
Продукты и услуги собираются под общие разделы, адреса старых категорий не меняются.
Индекс ленты ускоряет выдачу опубликованных объявлений «новые первыми».

Revision ID: 0012
Revises: 0011
Create Date: 2026-10-08
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0012"
down_revision: Union[str, None] = "0011"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SECTIONS = [
    ("product", "food", "Продукты"),
    ("service", "services", "Услуги"),
]

CHILDREN = {
    "food": [
        "pickles",
        "mushrooms",
        "berries",
        "vegetables",
        "honey",
        "bakery",
        "dairy",
        "meat-fish",
    ],
    "services": [
        "massage",
        "tutors",
        "beauty",
        "renovation",
        "car-repair",
        "cleaning",
        "moving",
        "computer-help",
        "photo-video",
        "other-services",
    ],
}

ROOTS = [
    "food",
    "services",
    "clothes",
    "kids",
    "electronics",
    "furniture",
    "auto-parts",
    "hobby",
    "other-goods",
]

categories = sa.table(
    "categories",
    sa.column("id", sa.Integer),
    sa.column("parent_id", sa.Integer),
    sa.column("kind", sa.String),
    sa.column("slug", sa.String),
    sa.column("name", sa.String),
    sa.column("sort_order", sa.Integer),
)


def upgrade() -> None:
    op.add_column("categories", sa.Column("parent_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_categories_parent_id",
        "categories",
        "categories",
        ["parent_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_index("ix_categories_parent_id", "categories", ["parent_id"])

    op.bulk_insert(
        categories,
        [{"kind": kind, "slug": slug, "name": name, "sort_order": 0} for kind, slug, name in SECTIONS],
    )

    for parent_slug, slugs in CHILDREN.items():
        parent_id = sa.select(categories.c.id).where(categories.c.slug == parent_slug).scalar_subquery()

        for position, slug in enumerate(slugs):
            op.execute(
                categories.update()
                .where(categories.c.slug == slug)
                .values(parent_id=parent_id, sort_order=position)
            )

    for position, slug in enumerate(ROOTS):
        op.execute(
            categories.update().where(categories.c.slug == slug).values(sort_order=position)
        )

    op.create_index(
        "ix_listings_feed",
        "listings",
        [sa.text("published_at DESC"), sa.text("id DESC")],
        postgresql_where=sa.text("status = 'published'"),
    )


def downgrade() -> None:
    op.drop_index("ix_listings_feed", table_name="listings")

    op.execute(categories.update().values(parent_id=None))
    op.execute(
        categories.delete().where(categories.c.slug.in_([slug for _, slug, _ in SECTIONS]))
    )

    op.drop_index("ix_categories_parent_id", table_name="categories")
    op.drop_constraint("fk_categories_parent_id", "categories", type_="foreignkey")
    op.drop_column("categories", "parent_id")
