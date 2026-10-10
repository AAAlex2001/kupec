"use client";

import { useEffect } from "react";
import {
  fetchNotifications,
  markNotificationsRead,
  NotificationItem,
  type Notification,
  type NotificationPage,
} from "@/entities/notification";
import { usePaged } from "@/shared/lib/use-paged";
import { reportError } from "@/shared/lib/report-error";
import Button from "@/shared/ui/button";
import EmptyState from "@/shared/ui/empty-state";
import { BellIcon } from "@/shared/ui/icons";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

const PAGE_SIZE = 20;

/** Раздел «Уведомления»: комментарии, ответы, лайки, репосты и подписки. Открыли — всё прочитано. */
const Notifications = () => {
  const list = usePaged<Notification, NotificationPage>("notifications", (offset) =>
    fetchNotifications(PAGE_SIZE, offset),
  );

  useEffect(() => {
    markNotificationsRead().catch(reportError);
  }, []);

  return (
    <div className={styles.notifications}>
      <Title as="h1">Уведомления</Title>

      {list.error && <Notice tone="error">{list.error}</Notice>}
      {!list.items && !list.error && <Loader />}

      {list.items?.length === 0 && (
        <EmptyState
          icon={<BellIcon />}
          title="Уведомлений пока нет"
          text="Здесь появятся комментарии, ответы, лайки, репосты и новые подписчики."
        />
      )}

      <div className={styles.list}>
        {list.items?.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>

      {list.hasMore && (
        <Button variant="secondary" loading={list.loadingMore} onClick={list.loadMore}>
          Показать ещё
        </Button>
      )}
    </div>
  );
};

export default Notifications;
