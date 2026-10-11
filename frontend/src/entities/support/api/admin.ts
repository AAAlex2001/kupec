import { request } from "@/shared/api";
import { messageBody } from "../lib/message-body";
import type { AdminSupportDetail, AdminSupportPage, SupportMessage } from "../model/types";

/** Обращения в поддержку: сначала без ответа, потом свежие. */
export const fetchSupportThreads = (limit: number, offset: number) =>
  request<AdminSupportPage>(`/v1/admin/support?limit=${limit}&offset=${offset}`);

/** Обращение целиком. Открытое считается прочитанным. */
export const fetchAdminSupportThread = (id: number) =>
  request<AdminSupportDetail>(`/v1/admin/support/${id}`);

/** Ответить посетителю: текст и до 5 фото. */
export const replySupport = (id: number, text: string, files: File[]) =>
  request<SupportMessage>(`/v1/admin/support/${id}/messages`, { method: "POST", body: messageBody(text, files) });
