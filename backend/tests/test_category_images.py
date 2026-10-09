"""Тесты картинок категорий: адрес в ответе API и прозрачность после загрузки."""

from io import BytesIO

from PIL import Image

from app.catalog.models import Category, ListingKind
from app.catalog.schemas import CategoryNodeSchema, CategorySchema
from app.catalog.services.tree import CategoryTree
from app.core.uploads import strip_metadata

FOOD = Category(
    id=1,
    kind=ListingKind.PRODUCT,
    slug="food",
    name="Продукты",
    image_path="categories/food.webp",
)
HONEY = Category(
    id=2,
    parent_id=1,
    kind=ListingKind.PRODUCT,
    slug="honey",
    name="Мёд",
)


def test_image_url_comes_with_category_and_its_children() -> None:
    node = CategoryNodeSchema.from_tree(CategoryTree([FOOD, HONEY]), FOOD)

    assert node.image_url == "/media/categories/food.webp"
    assert node.children[0].image_url is None
    assert CategorySchema.model_validate(FOOD).image_url == node.image_url


def test_uploaded_webp_keeps_transparent_background() -> None:
    image = Image.new("RGBA", (8, 8), (0, 0, 0, 0))
    image.putpixel((4, 4), (0, 160, 255, 255))
    source = BytesIO()
    image.save(source, format="WEBP", lossless=True)

    with Image.open(BytesIO(strip_metadata(source.getvalue()))) as cleaned:
        assert cleaned.getpixel((0, 0))[3] == 0
        assert cleaned.getpixel((4, 4))[3] == 255
