import { load } from "@/shared/api/server";
import { listingsPath } from "../lib/query";
import type { Listing, ListingOptions, ListingPage, ListingQuery } from "../model/types";

const EMPTY_OPTIONS: ListingOptions = { categories: [], units: [], service_places: [] };

const EMPTY_PAGE: ListingPage = { items: [], total: 0 };

/** Справочники формы размещения с сервера Next.js. */
export const getListingOptions = () =>
  load<ListingOptions>("/v1/listings/options", EMPTY_OPTIONS);

/** Лента опубликованных объявлений с сервера Next.js. */
export const getListings = (query: ListingQuery) =>
  load<ListingPage>(listingsPath(query), EMPTY_PAGE);

/** Объявление по id с сервера Next.js. С cookie автор видит и свой черновик. Нет — null. */
export const getListing = (id: number, headers?: HeadersInit) =>
  load<Listing | null>(`/v1/listings/${id}`, null, headers);

/** Похожие объявления по категориям от самой узкой к разделу: добираем из родительских, без повторов. */
export const getSimilarListings = async (slugs: string[], excludeId: number, limit: number) => {
  const found = new Map<number, Listing>();

  for (const slug of slugs) {
    if (found.size >= limit) break;

    const page = await getListings({ category: slug, exclude: excludeId, limit });
    page.items.forEach((item) => found.set(item.id, item));
  }

  return [...found.values()].slice(0, limit);
};
