import { jsonBody, request } from "@/shared/api";
import type { User } from "../model/types";

export type CodeSent = {
  resend_after: number;
  expires_in: number;
};

/** Зарегистрироваться по почте и паролю. На почту приходит код подтверждения. */
export const register = (email: string, password: string) =>
  request<CodeSent>("/v1/auth/register", jsonBody("POST", { email, password }));

/** Подтвердить почту кодом из письма. Бэкенд ставит cookie сессии. */
export const confirmEmail = (email: string, code: string) =>
  request<User>("/v1/auth/register/confirm", jsonBody("POST", { email, code }));

/** Войти по почте и паролю. Бэкенд ставит cookie сессии. */
export const login = (email: string, password: string) =>
  request<User>("/v1/auth/login", jsonBody("POST", { email, password }));

/** Отправить код восстановления пароля. */
export const requestPasswordReset = (email: string) =>
  request<CodeSent>("/v1/auth/password/reset", jsonBody("POST", { email }));

/** Задать новый пароль по коду из письма. Бэкенд ставит cookie сессии. */
export const resetPassword = (email: string, code: string, password: string) =>
  request<User>("/v1/auth/password/reset/confirm", jsonBody("POST", { email, code, password }));
