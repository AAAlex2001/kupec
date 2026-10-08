import { API_INTERNAL_URL } from "./config";

/** GET-запрос к бэкенду с сервера Next.js. При любой ошибке возвращает fallback. */
export const load = async <T>(path: string, fallback: T, headers?: HeadersInit): Promise<T> => {
  try {
    const response = await fetch(`${API_INTERNAL_URL}${path}`, { cache: "no-store", headers });

    return response.ok ? await response.json() : fallback;
  } catch {
    return fallback;
  }
};
