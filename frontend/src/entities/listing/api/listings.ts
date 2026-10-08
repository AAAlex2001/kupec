import { jsonBody, request } from "@/shared/api";
import type {
  Listing,
  ListingPayload,
  ListingPhoto,
  ListingStatus,
  MyListings,
} from "../model/types";

/** Загрузить фото для будущего объявления. */
export const uploadListingPhoto = (file: File) => {
  const body = new FormData();
  body.append("file", file);

  return request<ListingPhoto>("/v1/listings/photos", { method: "POST", body });
};

/** Удалить загруженное фото, пока объявление не сохранено. */
export const deleteListingPhoto = (photoId: number) =>
  request<void>(`/v1/listings/photos/${photoId}`, { method: "DELETE" });

/** Опубликовать объявление или сохранить черновик. */
export const createListing = (payload: ListingPayload) =>
  request<Listing>("/v1/listings", jsonBody("POST", payload));

/** Сохранить правку своего объявления. */
export const updateListing = (id: number, payload: ListingPayload) =>
  request<Listing>(`/v1/listings/${id}`, jsonBody("PUT", payload));

/** Засчитать просмотр объявления. Повтор за сутки бэкенд не считает. */
export const countListingView = (id: number) =>
  request<void>(`/v1/listings/${id}/view`, { method: "POST" });

/** Свои объявления на вкладке и счётчики вкладок. */
export const fetchMyListings = (status: ListingStatus, query: string) =>
  request<MyListings>(
    `/v1/listings/my?status=${status}&q=${encodeURIComponent(query.trim())}`,
  );

/** Снять объявление с публикации. */
export const archiveListing = (id: number) =>
  request<Listing>(`/v1/listings/${id}/archive`, { method: "POST" });

/** Снова опубликовать снятое объявление. */
export const restoreListing = (id: number) =>
  request<Listing>(`/v1/listings/${id}/restore`, { method: "POST" });

/** Удалить черновик или снятое объявление. */
export const deleteListing = (id: number) =>
  request<void>(`/v1/listings/${id}`, { method: "DELETE" });
