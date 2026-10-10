import type { ArticleSection } from "@/entities/article";
import { getArticles } from "@/entities/article/server";

export const ARTICLES_PAGE_SIZE = 12;

/** Страница раздела с сервера Next.js по номеру из ?page=. */
export const loadArticlePage = (section: ArticleSection, pageNumber: number) =>
  getArticles(section, ARTICLES_PAGE_SIZE, (pageNumber - 1) * ARTICLES_PAGE_SIZE);
