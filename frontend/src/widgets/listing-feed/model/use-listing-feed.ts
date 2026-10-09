"use client";

import { useState } from "react";
import { fetchListings, type ListingPage, type ListingQuery } from "@/entities/listing";
import { FEED_PAGE_SIZE } from "@/shared/config/feed";
import { errorMessage } from "@/shared/lib/errors";

export type FeedQuery = Pick<ListingQuery, "category" | "city" | "filters">;

/** Лента с первой страницей с сервера и подгрузкой «Показать ещё». */
export const useListingFeed = (initial: ListingPage, query: FeedQuery) => {
  const [page, setPage] = useState(initial);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = async () => {
    setLoadingMore(true);
    setError(null);

    try {
      const more = await fetchListings({
        ...query,
        limit: FEED_PAGE_SIZE,
        offset: page.items.length,
      });
      setPage({ items: [...page.items, ...more.items], total: more.total });
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось загрузить"));
    }

    setLoadingMore(false);
  };

  return { page, loadingMore, error, loadMore };
};
