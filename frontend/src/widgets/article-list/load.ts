import type { ArticleSection } from "@/entities/article";
import { getArticles } from "@/entities/article/server";
import { ARTICLES_PAGE_SIZE } from "./model/constants";

/** Страница статей раздела по номеру из ?page= с сервера Next.js. */
export const loadArticlePage = (section: ArticleSection, pageNumber: number) =>
  getArticles(section, ARTICLES_PAGE_SIZE, (pageNumber - 1) * ARTICLES_PAGE_SIZE);
