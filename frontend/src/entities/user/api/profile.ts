import { jsonBody, request } from "@/shared/api";
import type { User, UserChanges } from "../model/types";

/** Изменить профиль: передаются только меняющиеся поля. */
export const updateProfile = (changes: UserChanges) =>
  request<User>("/v1/me", jsonBody("PATCH", changes));

/** Загрузить новый аватар. */
export const uploadAvatar = (file: File) => {
  const body = new FormData();
  body.append("file", file);

  return request<User>("/v1/me/avatar", { method: "PUT", body });
};

/** Отправить код на новую почту. Почта меняется только после ввода кода. */
export const requestEmailChange = (email: string) =>
  request<void>("/v1/auth/email", jsonBody("POST", { email }));

/** Подтвердить новую почту кодом из письма. */
export const confirmEmailChange = (code: string) =>
  request<User>("/v1/auth/email/confirm", jsonBody("POST", { code }));

/** Выйти на этом устройстве. */
export const logout = () => request<void>("/v1/auth/logout", { method: "POST" });
