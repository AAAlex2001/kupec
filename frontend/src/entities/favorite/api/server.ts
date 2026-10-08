import { load } from "@/shared/api/server";

/** id объявлений в избранном с сервера Next.js. Без входа — пустой список. */
export const getFavoriteIds = (headers: HeadersInit) =>
  load<number[]>("/v1/favorites/ids", [], headers);
