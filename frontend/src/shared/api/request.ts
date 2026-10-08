import { API_URL } from "./config";
import { readErrorMessage } from "./errors";

/** Запрос к API из браузера с cookie входа. Ошибку бэкенда бросает с её текстом. */
export const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, { credentials: "include", ...init });

  if (!response.ok) throw new Error(await readErrorMessage(response));

  return response.status === 204 ? (undefined as T) : response.json();
};

/** Параметры запроса с JSON-телом. */
export const jsonBody = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
