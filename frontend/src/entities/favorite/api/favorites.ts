import type { Listing } from "@/entities/listing";
import { request } from "@/shared/api";

/** id объявлений в избранном. */
export const fetchFavoriteIds = () => request<number[]>("/v1/favorites/ids");

/** Объявления из избранного, недавно добавленные первыми. */
export const fetchFavorites = () => request<Listing[]>("/v1/favorites");

/** Добавить объявление в избранное. */
export const addFavorite = (listingId: number) =>
  request<void>(`/v1/favorites/${listingId}`, { method: "PUT" });

/** Убрать объявление из избранного. */
export const removeFavorite = (listingId: number) =>
  request<void>(`/v1/favorites/${listingId}`, { method: "DELETE" });
