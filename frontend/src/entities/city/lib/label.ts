import type { City } from "../model/types";

export const COUNTRY = "Россия";

/** Части через запятую без пустых и повторов: у Москвы город и регион совпадают. */
const joinParts = (parts: (string | null)[]) => [...new Set(parts.filter(Boolean))].join(", ");

/** Подсказка в списке, чтобы различать тёзок: «Деревня · Московская область · Одинцово город». */
export const cityHint = (city: City) =>
  [city.settlement_type, city.region, city.district].filter(Boolean).join(" · ");

/** Название в поле выбора: «Мегет, Иркутская область, Ангарский район». */
export const cityLabel = (city: City) => joinParts([city.name, city.region, city.district]);

/** Полный адрес для карты и подсказок: «Иркутская область, Ангарский район, Ангарск, улица Ленина, 5». */
export const cityAddress = (city: City, street = "") =>
  joinParts([city.region, city.district, city.name, street.trim()]);

/** Где ищем объявления: выбранный пункт или вся Россия. */
export const locationName = (city: City | null) => (city ? city.name : COUNTRY);
