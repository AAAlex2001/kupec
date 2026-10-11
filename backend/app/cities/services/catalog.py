"""Импорт каталога населённых пунктов ФНС: новые добавляются, старые ID и привязки сохраняются."""

import csv
import gzip
import hashlib
import json
import re
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path

import sqlalchemy as sa
from sqlalchemy.engine import Connection

ASSETS = Path(__file__).resolve().parents[3] / "assets" / "locations"
LEGACY_REGION = "Иркутская область"
BATCH_SIZE = 1000
DISTRICT_SUFFIX = re.compile(r"\s+(?:муниципальный округ|городской округ|район|улус)\b.*$")

CITIES = sa.table(
    "cities",
    sa.column("id", sa.Integer),
    sa.column("name", sa.String),
    sa.column("region", sa.String),
    sa.column("district", sa.String),
    sa.column("settlement_type", sa.String),
    sa.column("kladr_code", sa.String),
    sa.column("sort_order", sa.Integer),
)
CITY_LINKS = [
    sa.table("listings", sa.column("city_id", sa.Integer)),
    sa.table("users", sa.column("city_id", sa.Integer)),
]


@dataclass
class ImportResult:
    """Итог импорта: сколько пунктов добавлено, сколько старых привязано к каталогу и сколько дублей удалено."""

    added: int
    matched: int
    removed: int


def normalize(value: str | None) -> str:
    """Название для сравнения: нижний регистр, «ё» как «е», одинарные пробелы."""

    return " ".join((value or "").lower().replace("ё", "е").split())


def district_key(value: str | None) -> str:
    """Район без «район», «муниципальный округ», «городской округ» и «улус»: старые и новые названия совпадают."""

    return DISTRICT_SUFFIX.sub("", normalize(value))


def name_key(row: dict) -> tuple[str, str]:
    """Ключ пункта для сопоставления: регион и название."""

    return row["region"], normalize(row["name"])


def load_catalog() -> list[dict]:
    """Каталог из assets/locations. Испорченный или неполный файл — ValueError."""

    source = ASSETS / "russia.csv.gz"
    metadata = json.loads((ASSETS / "metadata.json").read_text(encoding="utf-8"))
    if hashlib.sha256(source.read_bytes()).hexdigest() != metadata["catalog_sha256"]:
        raise ValueError("Контрольная сумма каталога населённых пунктов не совпадает")

    with gzip.open(source, "rt", encoding="utf-8", newline="") as stream:
        rows = list(csv.DictReader(stream))
    if len(rows) != metadata["count"]:
        raise ValueError("Каталог населённых пунктов неполон")

    for row in rows:
        row["district"] = row["district"] or None
        row["sort_order"] = int(row["sort_order"])

    return rows


def known_places(connection: Connection) -> dict[str, dict]:
    """Пункты, уже привязанные к каталогу, по коду КЛАДР."""

    stmt = sa.select(CITIES).where(CITIES.c.kladr_code.is_not(None))

    return {row["kladr_code"]: dict(row) for row in connection.execute(stmt).mappings()}


def save_place(connection: Connection, city_id: int, row: dict) -> None:
    """Записать в пункт данные из каталога."""

    connection.execute(CITIES.update().where(CITIES.c.id == city_id).values(**row))


def candidates_for(old: dict, by_name: dict[tuple, list[dict]], known: dict[str, dict]) -> list[dict]:
    """Свободные записи каталога для старого пункта: то же название в регионе, а при нескольких — тот же район."""

    candidates = [row for row in by_name[name_key(old)] if row["kladr_code"] not in known]
    if len(candidates) <= 1:
        return candidates

    return [row for row in candidates if district_key(row["district"]) == district_key(old["district"])]


def match_legacy(connection: Connection, rows: list[dict], known: dict[str, dict]) -> tuple[int, list[int]]:
    """Старым пунктам без кода присвоить их запись каталога.

    Вернуть, сколько привязано, и id неоднозначных, у которых в каталоге есть тёзки.
    """

    by_name = defaultdict(list)
    for row in rows:
        by_name[name_key(row)].append(row)

    legacy = connection.execute(sa.select(CITIES).where(CITIES.c.kladr_code.is_(None))).mappings().all()
    matched = 0
    duplicates = []
    for old in legacy:
        candidates = candidates_for(old, by_name, known)
        if len(candidates) == 1:
            save_place(connection, old["id"], candidates[0])
            known[candidates[0]["kladr_code"]] = {**candidates[0], "id": old["id"]}
            matched += 1
        elif by_name[name_key(old)]:
            duplicates.append(old["id"])

    return matched, duplicates


def refresh_known(connection: Connection, rows: list[dict], known: dict[str, dict]) -> None:
    """Обновить пункты, у которых в новой выгрузке изменились название, район или тип."""

    for row in rows:
        old = known.get(row["kladr_code"])
        if old and any(old[key] != value for key, value in row.items()):
            save_place(connection, old["id"], row)


def insert_new(connection: Connection, rows: list[dict], known: dict[str, dict]) -> int:
    """Добавить пункты, которых ещё нет, пачками. Вернуть, сколько добавлено."""

    new = [row for row in rows if row["kladr_code"] not in known]
    for start in range(0, len(new), BATCH_SIZE):
        connection.execute(CITIES.insert(), new[start : start + BATCH_SIZE])

    return len(new)


def remove_unused(connection: Connection, city_ids: list[int]) -> int:
    """Удалить старые дубли, на которые не ссылаются объявления и профили. Вернуть, сколько удалено."""

    if not city_ids:
        return 0

    used = [sa.exists().where(link.c.city_id == CITIES.c.id) for link in CITY_LINKS]
    stmt = CITIES.delete().where(CITIES.c.id.in_(city_ids), *[sa.not_(link) for link in used])

    return connection.execute(stmt).rowcount


def sync_catalog(connection: Connection, rows: list[dict]) -> ImportResult:
    """Привязать старые пункты, обновить известные, добавить новые и убрать неиспользуемые дубли.

    Повторный запуск ничего не дублирует.
    """

    known = known_places(connection)
    matched, duplicates = match_legacy(connection, rows, known)
    refresh_known(connection, rows, known)
    added = insert_new(connection, rows, known)
    removed = remove_unused(connection, duplicates)

    return ImportResult(added=added, matched=matched, removed=removed)
