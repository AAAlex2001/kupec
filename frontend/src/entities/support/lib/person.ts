import type { AdminSupportThread } from "../model/types";

/** Кто пишет в поддержку: имя или почта пользователя, а гость — «Гость №id обращения». */
export const supportPersonName = (thread: AdminSupportThread) => {
  if (!thread.user) return `Гость №${thread.id}`;

  return thread.user.name ?? thread.user.email;
};
