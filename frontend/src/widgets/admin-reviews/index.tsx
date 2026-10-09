"use client";

import { useState } from "react";
import {
  ReviewCard,
  fetchAdminReviews,
  type AdminReviewPage,
  type Review,
  type ReviewStatus,
} from "@/entities/review";
import { ModerationActions } from "@/features/moderate-review";
import { usePaged } from "@/shared/lib/use-paged";
import Button from "@/shared/ui/button";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import Tabs from "@/shared/ui/tabs";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

const TABS: { value: ReviewStatus; label: string }[] = [
  { value: "pending", label: "На проверке" },
  { value: "published", label: "Опубликованные" },
  { value: "rejected", label: "Отклонённые" },
];

const PAGE_SIZE = 20;

/** Админка «Отзывы»: модерация по вкладкам, старые первыми. */
const AdminReviews = () => {
  const [status, setStatus] = useState<ReviewStatus>("pending");
  const list = usePaged<Review, AdminReviewPage>(status, (offset) =>
    fetchAdminReviews(status, PAGE_SIZE, offset),
  );

  return (
    <section className={styles.section}>
      <Title as="h1">Отзывы</Title>

      <Tabs
        ariaLabel="Статус отзывов"
        value={status}
        tabs={TABS.map((tab) => ({ ...tab, count: list.page?.counts[tab.value] ?? 0 }))}
        onChange={(value) => setStatus(value as ReviewStatus)}
      />

      {list.error && <Notice tone="error">{list.error}</Notice>}
      {!list.items && !list.error && <Loader />}
      {list.items?.length === 0 && <p className={styles.empty}>Здесь пусто.</p>}

      <div className={styles.list}>
        {list.items?.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            showStatus
            notice={
              review.reject_reason && (
                <Notice tone="error">Причина отклонения: {review.reject_reason}</Notice>
              )
            }
            actions={<ModerationActions review={review} onDone={list.reload} />}
          />
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

export default AdminReviews;
