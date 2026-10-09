import type { ListingQuery } from "../model/types";

/** Адрес ленты с фильтрами: «/v1/listings?category=food&city=3&limit=12&price_to=500».
 *
 * filters — готовая строка фильтров посетителя из адреса страницы каталога или поиска.
 * bounds — вернуть ещё самую низкую и высокую цену для ползунка.
 */
export const listingsPath = ({
  kind,
  category,
  city,
  owner,
  exclude,
  filters,
  bounds,
  limit,
  offset = 0,
}: ListingQuery) => {
  const params = new URLSearchParams(filters);
  params.set("limit", String(limit));
  params.set("offset", String(offset));

  if (kind) params.set("kind", kind);
  if (category) params.set("category", category);
  if (city) params.set("city", String(city));
  if (owner) params.set("owner", String(owner));
  if (exclude) params.set("exclude", String(exclude));
  if (bounds) params.set("bounds", "true");

  return `/v1/listings?${params}`;
};
