import { load } from "@/shared/api/server";
import type { PublicUser } from "../model/types";

/** Открытый профиль автора с сервера Next.js. С cookie — подписан ли смотрящий. Нет — null. */
export const getPublicUser = (id: number, headers?: HeadersInit) =>
  load<PublicUser | null>(`/v1/users/${id}`, null, headers);
