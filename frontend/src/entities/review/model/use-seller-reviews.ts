"use client";

import { useState } from "react";
import { errorMessage } from "@/shared/lib/errors";
import { fetchSellerReviews } from "../api/reviews";
import { SELLER_REVIEWS_PAGE_SIZE } from "./config";
import type { ReviewPage } from "./types";

/** Отзывы о продавце: первые пришли с сервера, дальше — «Показать ещё». */
export const useSellerReviews = (sellerId: number, initial: ReviewPage) => {
  const [items, setItems] = useState(initial.items);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = async () => {
    setLoadingMore(true);

    try {
      const page = await fetchSellerReviews(sellerId, SELLER_REVIEWS_PAGE_SIZE, items.length);
      setItems([...items, ...page.items]);
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось загрузить отзывы"));
    }

    setLoadingMore(false);
  };

  return { items, total: initial.total, error, loadingMore, loadMore };
};
