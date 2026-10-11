"use client";

import { useState } from "react";
import { fetchListings, type ListingPage, type ListingQuery } from "@/entities/listing";
import { FEED_PAGE_SIZE } from "@/shared/config/feed";
import { errorMessage } from "@/shared/lib/errors";

export type FeedQuery = Pick<ListingQuery, "category" | "city" | "filters">;

/** Лента со страницей с сервера и подгрузкой «Показать ещё». start — с какого по счёту объявления начинается страница. */
export const useListingFeed = (initial: ListingPage, query: FeedQuery, start: number) => {
  const [page, setPage] = useState(initial);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next = start + page.items.length;

  const loadMore = async () => {
    setLoadingMore(true);
    setError(null);

    try {
      const more = await fetchListings({ ...query, limit: FEED_PAGE_SIZE, offset: next });
      setPage({ items: [...page.items, ...more.items], total: more.total });
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось загрузить"));
    }

    setLoadingMore(false);
  };

  return { page, next, hasMore: next < page.total, loadingMore, error, loadMore };
};
