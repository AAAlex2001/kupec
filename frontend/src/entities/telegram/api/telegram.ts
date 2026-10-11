import { request } from "@/shared/api";
import type { TelegramLink } from "../model/types";

/** Подключён ли Telegram и канал, и ссылка на бота для подключения. */
export const fetchTelegramLink = () => request<TelegramLink>("/v1/telegram/link");

/** Отключить Telegram: посты больше не уходят в канал. */
export const disconnectTelegram = () => request<void>("/v1/telegram/link", { method: "DELETE" });
