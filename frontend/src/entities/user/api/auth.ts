import { jsonBody, request } from "@/shared/api";
import type { User } from "../model/types";

export type CodeSent = {
  resend_after: number;
  expires_in: number;
};

/** Отправить код для входа на почту. Аккаунт создаётся при первом входе. */
export const requestLoginCode = (email: string) =>
  request<CodeSent>("/v1/auth/code", jsonBody("POST", { email }));

/** Войти по коду из письма. Бэкенд ставит cookie сессии. */
export const loginWithCode = (email: string, code: string) =>
  request<User>("/v1/auth/login", jsonBody("POST", { email, code }));
