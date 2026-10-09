import { jsonBody, request } from "@/shared/api";
import type { AdminReviewPage, Review, ReviewStatus } from "../model/types";

/** Отзывы на вкладке модерации и счётчики вкладок. */
export const fetchAdminReviews = (status: ReviewStatus, limit: number, offset: number) =>
  request<AdminReviewPage>(`/v1/admin/reviews?status=${status}&limit=${limit}&offset=${offset}`);

/** Опубликовать отзыв. */
export const approveReview = (id: number) =>
  request<Review>(`/v1/admin/reviews/${id}/approve`, { method: "POST" });

/** Отклонить отзыв с причиной. */
export const rejectReview = (id: number, reason: string) =>
  request<Review>(`/v1/admin/reviews/${id}/reject`, jsonBody("POST", { reason }));

/** Поправить текст отзыва. */
export const editReviewText = (id: number, text: string) =>
  request<Review>(`/v1/admin/reviews/${id}/text`, jsonBody("PUT", { text }));

/** Удалить любой отзыв. */
export const removeReview = (id: number) =>
  request<void>(`/v1/admin/reviews/${id}`, { method: "DELETE" });
