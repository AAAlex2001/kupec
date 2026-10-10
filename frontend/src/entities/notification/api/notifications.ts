import { request } from "@/shared/api";
import type { NotificationPage } from "../model/types";

/** Свои уведомления, новые первыми. */
export const fetchNotifications = (limit: number, offset: number) =>
  request<NotificationPage>(`/v1/notifications?limit=${limit}&offset=${offset}`);

/** Сколько непрочитанных уведомлений. */
export const fetchUnreadNotifications = () =>
  request<{ count: number }>("/v1/notifications/unread");

/** Отметить все уведомления прочитанными. */
export const markNotificationsRead = () =>
  request<void>("/v1/notifications/read", { method: "POST" });
