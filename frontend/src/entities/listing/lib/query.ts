import type { ListingQuery } from "../model/types";

/** Адрес ленты с фильтрами: «/v1/listings?kind=service&limit=10». */
export const listingsPath = ({ kind, category, owner, exclude, limit, offset = 0 }: ListingQuery) => {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });

  if (kind) params.set("kind", kind);
  if (category) params.set("category", category);
  if (owner) params.set("owner", String(owner));
  if (exclude) params.set("exclude", String(exclude));

  return `/v1/listings?${params}`;
};
