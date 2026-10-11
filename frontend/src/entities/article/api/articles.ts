import { request } from "@/shared/api";
import type { ArticleLikes, ArticlePage, ArticleSection } from "../model/types";

/** Следующая порция опубликованных статей раздела, новые первыми. */
export const fetchArticles = (section: ArticleSection, limit: number, offset: number) =>
  request<ArticlePage>(`/v1/articles?section=${section}&limit=${limit}&offset=${offset}`);

/** Засчитать просмотр статьи: один посетитель — один раз в сутки. */
export const countArticleView = (id: number) =>
  request<void>(`/v1/articles/${id}/view`, { method: "POST" });

/** Поставить или убрать лайк статье. */
export const toggleArticleLike = (id: number, liked: boolean) =>
  request<ArticleLikes>(`/v1/articles/${id}/like`, { method: liked ? "POST" : "DELETE" });
