export type Filters = Record<string, string>;

type SearchParams = Record<string, string | string[] | undefined>;

export const CHOICES_LIMIT = 5;

export const PRICE_EMPTY_MAX = 100_000;

export const NUMBER_EMPTY_MAX = 1_000;

const KEYS = ["q", "kind", "price_from", "price_to", "place", "sort"];

const ATTRIBUTE_PREFIX = "a.";

/** Фильтры посетителя из адреса страницы: только известные ключи и атрибуты «a.<адрес>». */
export const pickFilters = (params: SearchParams): Filters =>
  Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => typeof value === "string" && value !== "")
      .filter(([key]) => KEYS.includes(key) || key.startsWith(ATTRIBUTE_PREFIX)),
  ) as Filters;

/** Строка фильтров для адреса и запроса ленты: «price_to=500&a.vid=ogurcy». */
export const filtersQuery = (filters: Filters) => new URLSearchParams(filters).toString();

/** Ключ фильтра атрибута в адресе: «a.vid», «a.ves.from». */
export const attributeKey = (slug: string, suffix?: "from" | "to") =>
  suffix ? `${ATTRIBUTE_PREFIX}${slug}.${suffix}` : `${ATTRIBUTE_PREFIX}${slug}`;

/** Выбранные варианты из значения «ogurcy,tomaty». */
export const splitChoices = (value: string | undefined) => (value ? value.split(",") : []);
