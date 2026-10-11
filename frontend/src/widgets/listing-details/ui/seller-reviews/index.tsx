"use client";

import { useState } from "react";
import type { Listing } from "@/entities/listing";
import { ReviewCard, useSellerReviews, type ReviewPage } from "@/entities/review";
import { useUser } from "@/entities/user";
import { ReviewModal } from "@/features/write-review";
import { plural } from "@/shared/lib/format";
import Button from "@/shared/ui/button";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

type SellerReviewsProps = {
  listing: Listing;
  reviews: ReviewPage;
};

const REVIEWS: [string, string, string] = ["отзыв", "отзыва", "отзывов"];

const RATING = new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** «Отзывы об авторе»: средняя оценка, первые отзывы с сервера, «Показать ещё» и «Написать отзыв». */
const SellerReviews = ({ listing, reviews }: SellerReviewsProps) => {
  const { user, openAuth } = useUser();
  const [writing, setWriting] = useState(false);
  const { items, total, error, loadingMore, loadMore } = useSellerReviews(listing.owner.id, reviews);
  const isOwner = user?.id === listing.owner.id;
  const title = total > 0 ? `Отзывы об авторе · ${RATING.format(listing.owner.rating)}` : "Отзывы об авторе";

  return (
    <section className={styles.reviews}>
      <div className={styles.head}>
        <div className={styles.titleRow}>
          <Title>{title}</Title>
          {total > 0 && (
            <span className={styles.count}>
              {total} {plural(total, REVIEWS)}
            </span>
          )}
        </div>

        {!isOwner && (
          <Button variant="primary" onClick={() => (user ? setWriting(true) : openAuth())}>
            Написать отзыв
          </Button>
        )}
      </div>

      {error && <Notice tone="error">{error}</Notice>}
      {items.length === 0 && <p className={styles.empty}>Отзывов об авторе пока нет.</p>}

      {items.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}

      {items.length < total && (
        <Button variant="ghost" loading={loadingMore} onClick={loadMore}>
          Показать ещё отзывы
        </Button>
      )}

      <ReviewModal
        open={writing}
        target={{
          listingId: listing.id,
          title: listing.title,
          coverUrl: listing.photos[0]?.url ?? null,
          subtitle: listing.owner.name ?? "",
        }}
        onClose={() => setWriting(false)}
      />
    </section>
  );
};

export default SellerReviews;
