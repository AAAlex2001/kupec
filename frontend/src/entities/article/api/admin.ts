import { jsonBody, request } from "@/shared/api";
import type {
  AdminArticle,
  AdminArticlePage,
  ArticlePayload,
  ArticleSection,
} from "../model/types";

/** Статьи раздела для админки, с черновиками. */
export const fetchAdminArticles = (section: ArticleSection) =>
  request<AdminArticlePage>(`/v1/admin/articles?section=${section}`);

/** Статья для редактора, в том числе черновик. */
export const fetchAdminArticle = (id: number) =>
  request<AdminArticle>(`/v1/admin/articles/${id}`);

/** Создать статью. */
export const createArticle = (payload: ArticlePayload) =>
  request<AdminArticle>("/v1/admin/articles", jsonBody("POST", payload));

/** Изменить статью. */
export const updateArticle = (id: number, payload: ArticlePayload) =>
  request<AdminArticle>(`/v1/admin/articles/${id}`, jsonBody("PUT", payload));

/** Удалить статью вместе с обложкой. */
export const deleteArticle = (id: number) =>
  request<void>(`/v1/admin/articles/${id}`, { method: "DELETE" });

/** Загрузить обложку. Прежняя удаляется. */
export const uploadArticleCover = (id: number, file: File) => {
  const body = new FormData();
  body.append("file", file);

  return request<AdminArticle>(`/v1/admin/articles/${id}/cover`, { method: "PUT", body });
};

/** Убрать обложку. */
export const removeArticleCover = (id: number) =>
  request<AdminArticle>(`/v1/admin/articles/${id}/cover`, { method: "DELETE" });
