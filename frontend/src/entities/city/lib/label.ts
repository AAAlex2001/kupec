import type { City } from "../model/types";

export const REGION = "Иркутская область";

/** Название с районом для одноимённых сёл: «Култук, Слюдянский район». */
export const cityLabel = (city: City) =>
  city.district ? `${city.name}, ${city.district}` : city.name;

/** Полный адрес для карты: «Иркутская область, Ангарский район, Ангарск, улица Ленина, 5». */
export const cityAddress = (city: City, street = "") =>
  [REGION, city.district, city.name, street.trim()].filter(Boolean).join(", ");

/** Где ищем объявления: выбранный пункт или вся область. */
export const locationName = (city: City | null) => (city ? city.name : REGION);
