"use client";

import { useState } from "react";
import { ReviewCard, useMyReviews, type Review, type ReviewStatus } from "@/entities/review";
import { ReviewActions } from "@/features/manage-review";
import { ReviewModal, targetFromReview } from "@/features/write-review";
import { HOME_PATH } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import EmptyState from "@/shared/ui/empty-state";
import { StarIcon } from "@/shared/ui/icons";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import Tabs from "@/shared/ui/tabs";
import Title from "@/shared/ui/title";
import { TABS } from "./data";
import ReviewNotice from "./ui/review-notice";
import styles from "./style.module.scss";

/** Раздел «Мои отзывы»: вкладки по статусу, карточки с действиями и окно «Написать отзыв». */
const MyReviews = () => {
  const [status, setStatus] = useState<ReviewStatus>("published");
  const [writing, setWriting] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const { data, error, reload } = useMyReviews(status);

  const closeModal = () => {
    setWriting(false);
    setEditing(null);
  };

  return (
    <div className={styles.reviews}>
      <div className={styles.head}>
        <Title as="h1">Мои отзывы</Title>
        <Button onClick={() => setWriting(true)}>Написать отзыв</Button>
      </div>

      <Tabs
        ariaLabel="Статус отзывов"
        value={status}
        tabs={TABS.map((tab) => ({ ...tab, count: data?.counts[tab.value] ?? 0 }))}
        onChange={(value) => setStatus(value as ReviewStatus)}
      />

      {error && <Notice tone="error">{error}</Notice>}
      {!data && !error && <Loader />}

      {data?.items.length === 0 && (
        <EmptyState
          icon={<StarIcon />}
          title="Вы ещё не оставляли отзывы"
          text="Поделитесь личным опытом общения с автором или получения услуги и товара."
          action={<Button href={HOME_PATH}>Перейти к объявлениям</Button>}
        />
      )}

      <div className={styles.list}>
        {data?.items.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            showStatus
            notice={<ReviewNotice review={review} />}
            actions={
              <ReviewActions review={review} onEdit={() => setEditing(review)} onDeleted={reload} />
            }
          />
        ))}
      </div>

      <ReviewModal
        open={writing || editing !== null}
        target={editing ? targetFromReview(editing) : undefined}
        review={editing ?? undefined}
        onClose={closeModal}
        onSaved={reload}
      />
    </div>
  );
};

export default MyReviews;
