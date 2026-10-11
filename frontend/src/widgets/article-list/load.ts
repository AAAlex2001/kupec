import type { ArticleSection } from "@/entities/article";
import { getArticles } from "@/entities/article/server";
import { ARTICLES_PAGE_SIZE } from "./model/constants";

/** Первая порция статей раздела с сервера Next.js. */
export const loadArticlePage = (section: ArticleSection) =>
  getArticles(section, ARTICLES_PAGE_SIZE, 0);
