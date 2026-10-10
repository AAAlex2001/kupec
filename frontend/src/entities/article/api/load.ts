import { load } from "@/shared/api/server";
import type { Article, ArticlePage, ArticleSection } from "../model/types";

const EMPTY_PAGE: ArticlePage = { items: [], total: 0 };

/** Опубликованные статьи раздела с сервера Next.js, новые первыми. */
export const getArticles = (section: ArticleSection, limit: number, offset: number) =>
  load<ArticlePage>(
    `/v1/articles?section=${section}&limit=${limit}&offset=${offset}`,
    EMPTY_PAGE,
  );

/** Опубликованная статья раздела по адресу с сервера Next.js. С cookie — и лайк того, кто смотрит. Нет — null. */
export const getArticle = (section: ArticleSection, slug: string, headers?: HeadersInit) =>
  load<Article | null>(`/v1/articles/${section}/${encodeURIComponent(slug)}`, null, headers);
