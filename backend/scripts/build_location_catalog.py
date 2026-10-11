"""Подготовить компактный каталог из официальных KLADR.DBF и SOCRBASE.DBF ФНС."""

import argparse
import csv
import gzip
import hashlib
import io
import json
import struct
from collections import Counter
from pathlib import Path

ASSETS = Path(__file__).resolve().parents[1] / "assets" / "locations"
FIELDS = ("kladr_code", "name", "region", "district", "settlement_type", "sort_order")
NON_SETTLEMENTS = {
    "Район",
    "Сельсовет",
    "Сельское поселение",
    "Сельский округ",
    "Сельская администрация",
    "Сельское муницип.образование",
    "Территория",
    "Волость",
    "Промышленная зона",
    "Автодорога",
    "Квартал",
    "Микрорайон",
    "Планировочный район",
    "Массив",
}
POPULAR = {
    "Москва": 0,
    "Санкт-Петербург": 1,
    "Новосибирск": 2,
    "Екатеринбург": 3,
    "Казань": 4,
    "Нижний Новгород": 5,
    "Челябинск": 6,
    "Красноярск": 7,
    "Самара": 8,
    "Уфа": 9,
    "Ростов-на-Дону": 10,
    "Краснодар": 11,
    "Омск": 12,
    "Воронеж": 13,
    "Пермь": 14,
    "Волгоград": 15,
}


def dbf_rows(path: Path):
    """Читать символьные поля DBF КЛАДР без дополнительных зависимостей."""

    with path.open("rb") as stream:
        header = stream.read(32)
        count, header_size, record_size = struct.unpack_from("<IHH", header, 4)
        fields = []
        for _ in range((header_size - 33) // 32):
            field = stream.read(32)
            fields.append((field[:11].split(b"\0")[0].decode("ascii"), field[16]))
        stream.seek(header_size)
        for _ in range(count):
            record = stream.read(record_size)
            if len(record) != record_size:
                raise ValueError("Неполный DBF: загрузите архив заново")
            if record[:1] == b"*":
                continue
            offset = 1
            row = {}
            for name, size in fields:
                row[name] = record[offset : offset + size].decode("cp866").strip()
                offset += size
            yield row


def level(code: str) -> int:
    if code[8:11] != "000":
        return 4
    if code[5:8] != "000":
        return 3
    return 2 if code[2:5] != "000" else 1


def region_name(row: dict[str, str]) -> str:
    name, kind = row["NAME"], row["SOCR"]
    if kind == "Чувашия":
        return "Чувашская Республика"
    if kind == "Респ":
        return f"{name} Республика" if name.endswith("ая") else f"Республика {name}"
    if kind == "обл":
        return name if "область" in name else f"{name} область"
    if kind == "край":
        return f"{name} край"
    if kind == "Аобл":
        return f"{name} автономная область"
    if kind == "АО":
        return name if "округ" in name.lower() else f"{name} автономный округ"
    return name


def build(source: Path) -> list[dict]:
    types = {
        (int(row["LEVEL"]), row["SCNAME"]): row["SOCRNAME"]
        for row in dbf_rows(source / "SOCRBASE.DBF")
    }
    active = {
        row["CODE"]: row
        for row in dbf_rows(source / "KLADR.DBF")
        if row["CODE"].endswith("00") and not row["CODE"].startswith("99")
    }
    regions = {
        code[:2]: region_name(row) for code, row in active.items() if level(code) == 1
    }
    result = []
    for code, row in sorted(active.items()):
        item_level = level(code)
        kind = types.get((item_level, row["SOCR"]))
        if not kind or kind in NON_SETTLEMENTS:
            continue
        if item_level == 1 and row["SOCR"] != "г":
            continue
        if item_level == 2 and kind != "Город":
            continue
        parents = []
        for parent_code in (code[:5] + "00000000", code[:8] + "00000"):
            parent = active.get(parent_code)
            if not parent or parent_code == code or level(parent_code) == 1:
                continue
            parent_kind = types.get(
                (level(parent_code), parent["SOCR"]), parent["SOCR"]
            )
            label = f"{parent['NAME']} {parent_kind.lower()}"
            if label not in parents:
                parents.append(label)
        result.append(
            {
                "kladr_code": code,
                "name": row["NAME"],
                "region": regions[code[:2]],
                "district": ", ".join(parents),
                "settlement_type": kind,
                "sort_order": POPULAR.get(row["NAME"], 30) if kind == "Город" else 100,
            }
        )
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Каталог с распакованными DBF")
    parser.add_argument("--date", required=True, help="Дата выгрузки ФНС: YYYY.MM.DD")
    args = parser.parse_args()
    rows = build(args.source)
    ASSETS.mkdir(parents=True, exist_ok=True)
    output = ASSETS / "russia.csv.gz"
    with output.open("wb") as binary:
        with gzip.GzipFile(
            fileobj=binary, mode="wb", filename="", mtime=0
        ) as compressed:
            with io.TextIOWrapper(compressed, encoding="utf-8", newline="") as text:
                writer = csv.DictWriter(text, fieldnames=FIELDS)
                writer.writeheader()
                writer.writerows(rows)
    metadata = {
        "source": f"https://fias-file.nalog.ru/downloads/{args.date}/base.7z",
        "source_date": args.date,
        "source_sha256": hashlib.sha256(
            (args.source / "KLADR.DBF").read_bytes()
        ).hexdigest(),
        "catalog_sha256": hashlib.sha256(output.read_bytes()).hexdigest(),
        "count": len(rows),
        "regions": dict(sorted(Counter(row["region"] for row in rows).items())),
    }
    (ASSETS / "metadata.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Населённых пунктов: {len(rows)}. Регионов: {len(metadata['regions'])}.")


if __name__ == "__main__":
    main()
