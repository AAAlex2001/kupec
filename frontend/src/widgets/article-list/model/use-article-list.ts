"use client";

import { useState } from "react";
import { fetchArticles, type ArticlePage, type ArticleSection } from "@/entities/article";
import { errorMessage } from "@/shared/lib/errors";
import { ARTICLES_PAGE_SIZE } from "./constants";

/** Статьи раздела: страница с сервера и подгрузка следующих. start — с какой по счёту статьи начинается страница. */
export const useArticleList = (section: ArticleSection, initial: ArticlePage, start: number) => {
  const [page, setPage] = useState(initial);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next = start + page.items.length;

  const loadMore = async () => {
    setLoadingMore(true);
    setError(null);

    try {
      const more = await fetchArticles(section, ARTICLES_PAGE_SIZE, next);
      setPage({ items: [...page.items, ...more.items], total: more.total });
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось загрузить"));
    }

    setLoadingMore(false);
  };

  return { page, next, hasMore: next < page.total, loadingMore, error, loadMore };
};
