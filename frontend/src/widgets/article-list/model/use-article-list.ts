"use client";

import { useState } from "react";
import { fetchArticles, type ArticlePage, type ArticleSection } from "@/entities/article";
import { errorMessage } from "@/shared/lib/errors";
import { ARTICLES_PAGE_SIZE } from "./constants";

/** Статьи раздела: первая порция с сервера и подгрузка «Загрузить ещё». */
export const useArticleList = (section: ArticleSection, initial: ArticlePage) => {
  const [page, setPage] = useState(initial);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = async () => {
    setLoadingMore(true);
    setError(null);

    try {
      const more = await fetchArticles(section, ARTICLES_PAGE_SIZE, page.items.length);
      setPage({ items: [...page.items, ...more.items], total: more.total });
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось загрузить"));
    }

    setLoadingMore(false);
  };

  return { page, loadingMore, error, loadMore };
};
