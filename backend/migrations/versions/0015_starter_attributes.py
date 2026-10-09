"""starter attributes for categories

Начальное заполнение справочника атрибутов и их привязка к категориям.
Дальше атрибуты меняют в «Админка → Атрибуты» и «Категории → Атрибуты».

Revision ID: 0015
Revises: 0014
Create Date: 2026-10-08
"""

import re
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0015"
down_revision: Union[str, None] = "0014"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

LETTERS = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e", "ж": "zh", "з": "z",
    "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r",
    "с": "s", "т": "t", "у": "u", "ф": "f", "х": "h", "ц": "ts", "ч": "ch", "ш": "sh",
    "щ": "sch", "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
}

ATTRIBUTES = [
    ("condition", "Состояние", "select", None, ["Новое", "Б/у"]),
    ("delivery", "Доставка", "boolean", None, []),
    ("pickle-type", "Что в банке", "multiselect", None,
     ["Огурцы", "Помидоры", "Капуста", "Грибы", "Перец", "Кабачки", "Ассорти"]),
    ("jar-volume", "Объём банки", "number", "л", []),
    ("mushroom-type", "Грибы", "multiselect", None,
     ["Белые", "Подберёзовики", "Подосиновики", "Грузди", "Рыжики", "Опята", "Лисички", "Маслята"]),
    ("mushroom-state", "Заготовка", "select", None,
     ["Свежие", "Сушёные", "Солёные", "Маринованные", "Замороженные"]),
    ("berry-type", "Ягоды", "multiselect", None,
     ["Брусника", "Клюква", "Черника", "Голубика", "Жимолость", "Облепиха", "Смородина",
      "Малина", "Земляника"]),
    ("berry-state", "Заготовка", "select", None, ["Свежие", "Замороженные", "Сушёные"]),
    ("vegetable-type", "Овощи и фрукты", "multiselect", None,
     ["Картофель", "Морковь", "Свёкла", "Капуста", "Лук", "Чеснок", "Огурцы", "Помидоры",
      "Яблоки", "Зелень"]),
    ("honey-type", "Мёд", "select", None,
     ["Цветочный", "Липовый", "Гречишный", "Таёжный", "Кипрейный", "Донниковый"]),
    ("harvest-year", "Год сбора", "number", None, []),
    ("bakery-type", "Выпечка", "multiselect", None,
     ["Хлеб", "Пироги", "Пирожки", "Торты", "Печенье", "Пельмени и вареники"]),
    ("dairy-type", "Продукция", "multiselect", None,
     ["Молоко", "Творог", "Сметана", "Сыр", "Масло", "Яйца"]),
    ("meat-type", "Мясо и рыба", "multiselect", None,
     ["Говядина", "Свинина", "Баранина", "Птица", "Дичь", "Рыба", "Омуль", "Сало"]),
    ("experience", "Опыт", "select", None, ["До 1 года", "1–3 года", "3–5 лет", "Больше 5 лет"]),
    ("contract", "Работа по договору", "boolean", None, []),
    ("massage-type", "Вид массажа", "multiselect", None,
     ["Классический", "Лечебный", "Спортивный", "Антицеллюлитный", "Расслабляющий",
      "Детский", "Баночный"]),
    ("subject", "Предмет", "multiselect", None,
     ["Математика", "Русский язык", "Английский язык", "Физика", "Химия", "Биология",
      "История", "Обществознание", "Информатика", "Подготовка к школе"]),
    ("students", "Ученики", "multiselect", None,
     ["Дошкольники", "Начальная школа", "5–9 класс", "10–11 класс", "ЕГЭ и ОГЭ", "Студенты",
      "Взрослые"]),
    ("beauty-type", "Услуги красоты", "multiselect", None,
     ["Маникюр", "Педикюр", "Стрижки", "Окрашивание", "Брови и ресницы", "Макияж",
      "Косметология", "Эпиляция"]),
    ("renovation-type", "Работы", "multiselect", None,
     ["Под ключ", "Электрика", "Сантехника", "Отделка", "Плитка", "Окна и двери",
      "Мелкий ремонт"]),
    ("car-work", "Работы по авто", "multiselect", None,
     ["Диагностика", "Двигатель", "Ходовая", "Кузов", "Электрика", "Шиномонтаж", "ТО"]),
    ("cleaning-type", "Что убираем", "multiselect", None,
     ["Квартиры", "Дома", "После ремонта", "Офисы", "Мойка окон", "Химчистка мебели"]),
    ("vehicle", "Транспорт", "multiselect", None,
     ["Газель", "Грузовик до 5 т", "Грузовик больше 5 т", "Легковой с прицепом"]),
    ("loaders", "Есть грузчики", "boolean", None, []),
    ("computer-work", "Что делаем", "multiselect", None,
     ["Ремонт компьютеров", "Ремонт ноутбуков", "Установка программ", "Удаление вирусов",
      "Настройка интернета", "Восстановление данных"]),
    ("photo-type", "Съёмка", "multiselect", None,
     ["Свадьбы", "Портреты", "Детские", "Мероприятия", "Предметная", "Видео"]),
    ("gender", "Для кого", "select", None, ["Женское", "Мужское", "Детское", "Унисекс"]),
    ("clothing-size", "Размер", "select", None,
     ["XS", "S", "M", "L", "XL", "XXL и больше"]),
    ("kids-age", "Возраст ребёнка", "select", None,
     ["До 1 года", "1–3 года", "3–7 лет", "7 лет и старше"]),
    ("electronics-type", "Что это", "select", None,
     ["Телефоны", "Компьютеры и ноутбуки", "Планшеты", "ТВ и аудио", "Фото и видео",
      "Бытовая техника", "Аксессуары"]),
    ("room", "Комната", "select", None,
     ["Гостиная", "Спальня", "Кухня", "Детская", "Прихожая", "Для дачи"]),
    ("part-type", "Что это", "select", None,
     ["Запчасти", "Шины и диски", "Аккумуляторы", "Масла и автохимия", "Аксессуары"]),
]

BINDINGS = {
    "food": [("delivery", False)],
    "pickles": [("pickle-type", False), ("jar-volume", False)],
    "mushrooms": [("mushroom-type", False), ("mushroom-state", False)],
    "berries": [("berry-type", False), ("berry-state", False)],
    "vegetables": [("vegetable-type", False)],
    "honey": [("honey-type", False), ("harvest-year", False)],
    "bakery": [("bakery-type", False)],
    "dairy": [("dairy-type", False)],
    "meat-fish": [("meat-type", False)],
    "services": [("experience", False), ("contract", False)],
    "massage": [("massage-type", False)],
    "tutors": [("subject", False), ("students", False)],
    "beauty": [("beauty-type", False)],
    "renovation": [("renovation-type", False)],
    "car-repair": [("car-work", False)],
    "cleaning": [("cleaning-type", False)],
    "moving": [("vehicle", False), ("loaders", False)],
    "computer-help": [("computer-work", False)],
    "photo-video": [("photo-type", False)],
    "clothes": [("condition", True), ("gender", False), ("clothing-size", False)],
    "kids": [("condition", True), ("kids-age", False)],
    "electronics": [("condition", True), ("electronics-type", False)],
    "furniture": [("condition", True), ("room", False)],
    "auto-parts": [("condition", True), ("part-type", False)],
    "hobby": [("condition", True), ("delivery", False)],
    "other-goods": [("condition", True), ("delivery", False)],
}

attributes = sa.table(
    "attributes",
    sa.column("id", sa.Integer),
    sa.column("slug", sa.String),
    sa.column("name", sa.String),
    sa.column("type", sa.String),
    sa.column("unit", sa.String),
    sa.column("is_filterable", sa.Boolean),
)
attribute_options = sa.table(
    "attribute_options",
    sa.column("attribute_id", sa.Integer),
    sa.column("value", sa.String),
    sa.column("label", sa.String),
    sa.column("sort_order", sa.Integer),
)
category_attributes = sa.table(
    "category_attributes",
    sa.column("category_id", sa.Integer),
    sa.column("attribute_id", sa.Integer),
    sa.column("is_required", sa.Boolean),
    sa.column("sort_order", sa.Integer),
)
categories = sa.table("categories", sa.column("id", sa.Integer), sa.column("slug", sa.String))


def slugify(text: str) -> str:
    """Значение варианта латиницей: «Б/у» → «b-u», «1–3 года» → «1-3-goda»."""

    latin = "".join(LETTERS.get(letter, letter) for letter in text.lower())

    return re.sub(r"[^a-z0-9]+", "-", latin).strip("-")


def upgrade() -> None:
    connection = op.get_bind()

    for slug, name, attribute_type, unit, labels in ATTRIBUTES:
        attribute_id = connection.execute(
            attributes.insert()
            .values(slug=slug, name=name, type=attribute_type, unit=unit, is_filterable=True)
            .returning(attributes.c.id)
        ).scalar_one()

        if labels:
            op.bulk_insert(
                attribute_options,
                [
                    {
                        "attribute_id": attribute_id,
                        "value": slugify(label),
                        "label": label,
                        "sort_order": position,
                    }
                    for position, label in enumerate(labels)
                ],
            )

    ids = dict(connection.execute(sa.select(attributes.c.slug, attributes.c.id)).all())
    category_ids = dict(connection.execute(sa.select(categories.c.slug, categories.c.id)).all())

    op.bulk_insert(
        category_attributes,
        [
            {
                "category_id": category_ids[category_slug],
                "attribute_id": ids[attribute_slug],
                "is_required": is_required,
                "sort_order": position,
            }
            for category_slug, items in BINDINGS.items()
            if category_slug in category_ids
            for position, (attribute_slug, is_required) in enumerate(items)
        ],
    )


def downgrade() -> None:
    op.execute(attributes.delete().where(attributes.c.slug.in_([item[0] for item in ATTRIBUTES])))
