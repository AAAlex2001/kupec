import { cookies } from "next/headers";
import { load } from "@/shared/api/server";
import type { User } from "../model/types";

const SESSION_COOKIE = "session";

/** Заголовки с cookie входа для запросов к бэкенду с сервера. Без cookie — null. */
export const sessionHeaders = async (): Promise<HeadersInit | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  return token ? { Cookie: `${SESSION_COOKIE}=${token}` } : null;
};

/** Пользователь по cookie входа. Истёкшая сессия — null. */
export const getSessionUser = (headers: HeadersInit) => load<User | null>("/v1/me", null, headers);
