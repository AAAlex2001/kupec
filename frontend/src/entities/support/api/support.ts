import { request } from "@/shared/api";
import { messageBody } from "../lib/message-body";
import type { SupportMessage, SupportThread, SupportUnread } from "../model/types";

/** Своя переписка с поддержкой. Гость узнаётся по cookie. */
export const fetchSupportThread = () => request<SupportThread>("/v1/support/thread");

/** Сколько ответов поддержки ещё не открыто. */
export const fetchSupportUnread = () => request<SupportUnread>("/v1/support/unread");

/** Написать в поддержку: текст и до 5 фото. */
export const sendSupportMessage = (text: string, files: File[]) =>
  request<SupportMessage>("/v1/support/messages", { method: "POST", body: messageBody(text, files) });
