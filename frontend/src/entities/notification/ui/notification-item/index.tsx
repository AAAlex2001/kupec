import cn from "classnames";
import Link from "next/link";
import { formatMoment } from "@/shared/lib/format";
import Avatar from "@/shared/ui/avatar";
import { notificationHref, notificationText } from "../../lib/text";
import type { Notification } from "../../model/types";
import styles from "./style.module.scss";

type NotificationItemProps = {
  notification: Notification;
};

/** Уведомление: кто, что произошло и когда. Непрочитанное подсвечено. Ведёт к посту или к автору. */
const NotificationItem = ({ notification }: NotificationItemProps) => {
  const name = notification.actor.name ?? "Пользователь";

  return (
    <Link
      className={cn(styles.item, !notification.read && styles.unread)}
      href={notificationHref(notification)}
    >
      <Avatar src={notification.actor.avatar_url} letter={name[0]} />
      <span className={styles.text}>
        <span className={styles.name}>{name}</span> — {notificationText(notification)}
      </span>
      <span className={styles.time}>{formatMoment(notification.created_at)}</span>
    </Link>
  );
};

export default NotificationItem;
