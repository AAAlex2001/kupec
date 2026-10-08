import { request } from "@/shared/api";
import { listingsPath } from "../lib/query";
import type { ListingPage, ListingQuery } from "../model/types";

/** Лента опубликованных объявлений из браузера. */
export const fetchListings = (query: ListingQuery) => request<ListingPage>(listingsPath(query));
