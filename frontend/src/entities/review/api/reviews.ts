import { jsonBody, request } from "@/shared/api";
import type {
  Review,
  ReviewList,
  ReviewPage,
  ReviewPayload,
  ReviewPhoto,
  ReviewStatus,
  ReviewableListing,
} from "../model/types";

/** Свои отзывы на вкладке и счётчики вкладок. */
export const fetchMyReviews = (status: ReviewStatus) =>
  request<ReviewList>(`/v1/reviews/my?status=${status}`);

/** Объявления из переписок, по которым можно оставить отзыв. */
export const fetchReviewable = () => request<ReviewableListing[]>("/v1/reviews/reviewable");

/** Опубликованные отзывы о продавце. */
export const fetchSellerReviews = (sellerId: number, limit: number, offset: number) =>
  request<ReviewPage>(`/v1/reviews/seller/${sellerId}?limit=${limit}&offset=${offset}`);

/** Оставить отзыв по объявлению. */
export const createReview = (listingId: number, payload: ReviewPayload) =>
  request<Review>("/v1/reviews", jsonBody("POST", { ...payload, listing_id: listingId }));

/** Изменить свой отзыв. Он снова уходит на проверку. */
export const updateReview = (id: number, payload: ReviewPayload) =>
  request<Review>(`/v1/reviews/${id}`, jsonBody("PUT", payload));

/** Удалить свой отзыв. */
export const deleteReview = (id: number) =>
  request<void>(`/v1/reviews/${id}`, { method: "DELETE" });

/** Загрузить фото для отзыва. */
export const uploadReviewPhoto = (file: File) => {
  const body = new FormData();
  body.append("file", file);

  return request<ReviewPhoto>("/v1/reviews/photos", { method: "POST", body });
};

/** Удалить загруженное фото, пока отзыв не отправлен. */
export const deleteReviewPhoto = (photoId: number) =>
  request<void>(`/v1/reviews/photos/${photoId}`, { method: "DELETE" });
