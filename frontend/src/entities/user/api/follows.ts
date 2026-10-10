import { request } from "@/shared/api";

/** Подписаться на автора или отписаться. */
export const toggleFollow = (authorId: number, follow: boolean) =>
  request<void>(`/v1/follows/${authorId}`, { method: follow ? "PUT" : "DELETE" });
