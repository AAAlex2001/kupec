"use client";

import { useRef, useState } from "react";
import { fetchListings, type ListingPage } from "@/entities/listing";
import { FEED_PAGE_SIZE } from "@/shared/config/feed";
import { errorMessage } from "@/shared/lib/errors";

/** Лента главной: выбор категории чипсом и подгрузка «Показать ещё». */
export const useFeed = (latest: ListingPage) => {
  const [category, setCategory] = useState<string | null>(null);
  const [page, setPage] = useState(latest);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);

  const select = async (slug: string | null) => {
    const current = ++request.current;
    setCategory(slug);
    setError(null);

    if (slug === null) {
      setPage(latest);
      setLoading(false);

      return;
    }

    setLoading(true);

    try {
      const found = await fetchListings({ category: slug, limit: FEED_PAGE_SIZE });
      if (current === request.current) setPage(found);
    } catch (failure) {
      if (current === request.current) setError(errorMessage(failure, "Не удалось загрузить"));
    } finally {
      if (current === request.current) setLoading(false);
    }
  };

  const loadMore = async () => {
    const current = request.current;
    setLoadingMore(true);

    try {
      const more = await fetchListings({
        category: category ?? undefined,
        limit: FEED_PAGE_SIZE,
        offset: page.items.length,
      });

      if (current === request.current) {
        setPage({ items: [...page.items, ...more.items], total: more.total });
      }
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось загрузить"));
    } finally {
      setLoadingMore(false);
    }
  };

  return { category, page, loading, loadingMore, error, select, loadMore };
};
