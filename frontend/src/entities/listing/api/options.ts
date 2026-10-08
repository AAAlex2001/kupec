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
