import Image from "next/image";
import Link from "next/link";
import { listingPath } from "@/shared/config/routes";
import { reviewSellerLine } from "../../lib/labels";
import type { Review } from "../../model/types";
import styles from "./style.module.scss";

type ReviewListingProps = {
  review: Review;
};

/** Объявление в карточке отзыва: фото, название и автор. Удалённое — подписью. */
const ReviewListing = ({ review }: ReviewListingProps) => {
  const { listing } = review;

  return (
    <div className={styles.listing}>
      <div className={styles.photo}>
        {listing?.cover_url && (
          <Image className={styles.image} src={listing.cover_url} alt="" fill sizes="88px" unoptimized />
        )}
      </div>

      <div className={styles.info}>
        {listing ? (
          <Link className={styles.title} href={listingPath(listing.id)}>
            {listing.title}
          </Link>
        ) : (
          <p className={styles.removed}>Объявление удалено</p>
        )}
        <p className={styles.seller}>{reviewSellerLine(review)}</p>
      </div>
    </div>
  );
};

export default ReviewListing;
