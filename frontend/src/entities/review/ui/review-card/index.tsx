import type { ReactNode } from "react";
import { formatDate } from "@/shared/lib/format";
import Stars from "@/shared/ui/stars";
import { STATUS_LABELS } from "../../lib/labels";
import type { Review } from "../../model/types";
import ReviewListing from "../review-listing";
import ReviewPhotos from "../review-photos";
import styles from "./style.module.scss";

type ReviewCardProps = {
  review: Review;
  showStatus?: boolean;
  notice?: ReactNode;
  actions?: ReactNode;
};

/** Карточка отзыва: объявление, оценка, текст, фото, ответ продавца. Плашка и кнопки — слоты. */
const ReviewCard = ({ review, showStatus, notice, actions }: ReviewCardProps) => (
  <article className={styles.card}>
    <div className={styles.head}>
      <ReviewListing review={review} />
      {showStatus && <span className={styles.status}>{STATUS_LABELS[review.status]}</span>}
    </div>

    <div className={styles.meta}>
      <Stars rating={review.rating} />
      <span className={styles.author}>
        {review.author_name} · {formatDate(review.created_at)}
      </span>
    </div>

    {review.text && <p className={styles.text}>{review.text}</p>}
    {review.photos.length > 0 && <ReviewPhotos photos={review.photos} />}

    {review.reply_text && review.reply_at && (
      <div className={styles.reply}>
        <p className={styles.replyTitle}>
          Ответ {review.seller.name ?? "продавца"} · {formatDate(review.reply_at)}
        </p>
        <p className={styles.replyText}>{review.reply_text}</p>
      </div>
    )}

    {notice}

    {actions && <div className={styles.actions}>{actions}</div>}
  </article>
);

export default ReviewCard;
