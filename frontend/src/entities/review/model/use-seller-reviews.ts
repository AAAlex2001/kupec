"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/shared/lib/errors";
import { fetchSellerReviews } from "../api/reviews";
import type { Review } from "./types";

const PAGE_SIZE = 3;

/** Опубликованные отзывы о продавце: первые три и «показать ещё». */
export const useSellerReviews = (sellerId: number) => {
  const [items, setItems] = useState<Review[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let active = true;

    fetchSellerReviews(sellerId, PAGE_SIZE, 0)
      .then((page) => {
        if (!active) return;
        setItems(page.items);
        setTotal(page.total);
      })
      .catch((failure) => active && setError(errorMessage(failure, "Не удалось загрузить отзывы")));

    return () => {
      active = false;
    };
  }, [sellerId]);

  const loadMore = async () => {
    setLoadingMore(true);

    try {
      const page = await fetchSellerReviews(sellerId, PAGE_SIZE, items?.length ?? 0);
      setItems((current) => [...(current ?? []), ...page.items]);
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось загрузить отзывы"));
    }

    setLoadingMore(false);
  };

  return { items, total, error, loadingMore, loadMore };
};
