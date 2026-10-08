import { jsonBody, request } from "@/shared/api";
import type { Conversation, ConversationDetail, Message } from "../model/types";

/** Переписки пользователя, свежие первыми. query ищет по объявлению и имени. */
export const fetchConversations = (query: string) =>
  request<Conversation[]>(`/v1/conversations?q=${encodeURIComponent(query.trim())}`);

/** Сколько всего непрочитанных сообщений. */
export const fetchUnreadCount = () => request<{ count: number }>("/v1/conversations/unread");

/** «Написать» по объявлению: новая переписка или уже начатая. */
export const startConversation = (listingId: number) =>
  request<Conversation>("/v1/conversations", jsonBody("POST", { listing_id: listingId }));

/** Переписка со всеми сообщениями. Входящие отмечаются прочитанными. */
export const fetchConversation = (id: number) =>
  request<ConversationDetail>(`/v1/conversations/${id}`);

/** Заблокировать собеседника по переписке. */
export const blockCompanion = (conversationId: number) =>
  request<void>(`/v1/conversations/${conversationId}/block`, { method: "PUT" });

/** Снять блокировку с собеседника. */
export const unblockCompanion = (conversationId: number) =>
  request<void>(`/v1/conversations/${conversationId}/block`, { method: "DELETE" });

/** Отправить сообщение. */
export const sendMessage = (conversationId: number, text: string) =>
  request<Message>(`/v1/conversations/${conversationId}/messages`, jsonBody("POST", { text }));
