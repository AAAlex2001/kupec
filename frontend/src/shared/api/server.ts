import { unstable_rethrow } from "next/navigation";
import { reportError } from "@/shared/lib/report-error";
import { API_INTERNAL_URL } from "./config";

/** GET-запрос к бэкенду с сервера Next.js. Не нашлось или бэкенд недоступен — fallback, сбой пишется в лог.
 *
 * Служебные ошибки Next.js (например, «страница динамическая») пробрасываются дальше, как требует фреймворк.
 */
export const load = async <T>(path: string, fallback: T, headers?: HeadersInit): Promise<T> => {
  try {
    const response = await fetch(`${API_INTERNAL_URL}${path}`, { cache: "no-store", headers });

    return response.ok ? await response.json() : fallback;
  } catch (failure) {
    unstable_rethrow(failure);
    reportError(failure);

    return fallback;
  }
};
