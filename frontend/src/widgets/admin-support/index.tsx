"use client";

import { fetchSupportThreads, type AdminSupportPage, type AdminSupportThread } from "@/entities/support";
import { usePaged } from "@/shared/lib/use-paged";
import Button from "@/shared/ui/button";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import SupportRow from "./ui/support-row";
import styles from "./style.module.scss";

const PAGE_SIZE = 20;

/** Админка «Поддержка»: обращения гостей и пользователей, сначала без ответа. */
const AdminSupport = () => {
  const list = usePaged<AdminSupportThread, AdminSupportPage>("support", (offset) =>
    fetchSupportThreads(PAGE_SIZE, offset),
  );
  const unread = list.page?.unread ?? 0;

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <Title as="h1">Поддержка</Title>
        {unread > 0 && <span className={styles.unread}>ждут ответа: {unread}</span>}
      </div>

      {list.error && <Notice tone="error">{list.error}</Notice>}
      {!list.items && !list.error && <Loader />}
      {list.items?.length === 0 && <p className={styles.empty}>Обращений пока нет.</p>}

      <div className={styles.list}>
        {list.items?.map((thread) => (
          <SupportRow key={thread.id} thread={thread} />
        ))}
      </div>

      {list.hasMore && (
        <Button variant="secondary" loading={list.loadingMore} onClick={list.loadMore}>
          Показать ещё
        </Button>
      )}
    </section>
  );
};

export default AdminSupport;
