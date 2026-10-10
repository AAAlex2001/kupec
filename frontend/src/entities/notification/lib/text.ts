import { postCommentsPath, postPath, userPath } from "@/shared/config/routes";
import type { Notification, NotificationKind } from "../model/types";

const TEXTS: Record<NotificationKind, string> = {
  comment: "новый комментарий к вашей публикации",
  reply: "ответ на ваш комментарий",
  like: "отметка «Нравится» на вашей публикации",
  repost: "репост вашей публикации",
  follow: "новый подписчик",
};

/** Что произошло: «новый комментарий к вашей публикации». */
export const notificationText = (notification: Notification) => TEXTS[notification.kind];

/** Куда ведёт уведомление: к комментариям поста, к посту или к тому, кто подписался. */
export const notificationHref = (notification: Notification) => {
  if (notification.post_id === null) return userPath(notification.actor.id);
  if (notification.kind === "comment" || notification.kind === "reply") {
    return postCommentsPath(notification.post_id);
  }

  return postPath(notification.post_id);
};
