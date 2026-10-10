import { request } from "@/shared/api";
import type { AdminPostPage, Post, PostStatus, ReportPage, ReportStatus } from "../model/types";

/** Посты всех авторов на вкладке модерации и счётчики вкладок. */
export const fetchAdminPosts = (status: PostStatus, limit: number, offset: number) =>
  request<AdminPostPage>(`/v1/admin/posts?status=${status}&limit=${limit}&offset=${offset}`);

/** Посты одного пользователя для админки: опубликованные, черновики или скрытые, без репостов. */
export const fetchAdminUserPosts = (
  userId: number,
  status: PostStatus,
  limit: number,
  offset: number,
) =>
  request<AdminPostPage>(
    `/v1/admin/users/${userId}/posts?status=${status}&limit=${limit}&offset=${offset}`,
  );

/** Скрыть пост из ленты. */
export const hidePost = (id: number) =>
  request<Post>(`/v1/admin/posts/${id}/hide`, { method: "POST" });

/** Вернуть скрытый пост в ленту. */
export const showPost = (id: number) =>
  request<Post>(`/v1/admin/posts/${id}/show`, { method: "POST" });

/** Удалить любой пост. */
export const removePost = (id: number) =>
  request<void>(`/v1/admin/posts/${id}`, { method: "DELETE" });

/** Удалить любой комментарий вместе с ответами. */
export const removeComment = (id: number) =>
  request<void>(`/v1/admin/comments/${id}`, { method: "DELETE" });

/** Жалобы на вкладке и счётчики вкладок. */
export const fetchReports = (status: ReportStatus, limit: number, offset: number) =>
  request<ReportPage>(`/v1/admin/reports?status=${status}&limit=${limit}&offset=${offset}`);

/** Отклонить жалобу: нарушений нет. */
export const dismissReport = (id: number) =>
  request<void>(`/v1/admin/reports/${id}/dismiss`, { method: "POST" });
