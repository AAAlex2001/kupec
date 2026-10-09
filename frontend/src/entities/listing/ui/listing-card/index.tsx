import Image from "next/image";
import type { ReactNode } from "react";
import { formatRub } from "@/shared/lib/format";
import Button from "@/shared/ui/button";
import { HeartIcon, MessageCircleMoreIcon } from "@/shared/ui/icons";
import RatingLabel from "@/shared/ui/rating-label";
import CardLink from "../card-link";
import styles from "./style.module.scss";

type ListingCardProps = {
  photoUrl: string | null;
  price: string | null;
  unitLabel: string | null;
  title: string;
  author: string;
  rating?: number;
  reviewsCount?: number;
  place: string;
  conditions: string;
  href?: string;
  favorite?: ReactNode;
  action?: ReactNode;
};

const DEFAULT_FAVORITE = <HeartIcon className={styles.heart} />;

const DEFAULT_ACTION = (
  <Button variant="secondary">
    <MessageCircleMoreIcon />
    Написать
  </Button>
);

/** Карточка объявления без отступов: фото ровно по краю сетки. Сердечко и кнопку подставляют снаружи. */
const ListingCard = ({
  photoUrl,
  price,
  unitLabel,
  title,
  author,
  rating = 0,
  reviewsCount = 0,
  place,
  conditions,
  href,
  favorite = DEFAULT_FAVORITE,
  action = DEFAULT_ACTION,
}: ListingCardProps) => (
  <article className={styles.card}>
    <CardLink className={styles.photo} href={href}>
      {photoUrl && (
        <Image className={styles.image} src={photoUrl} alt="" fill sizes="388px" unoptimized />
      )}
    </CardLink>

    <div className={styles.priceRow}>
      <p className={styles.price}>
        {price ? formatRub(price) : "Цена не указана"}
        {price && unitLabel && <span className={styles.unit}> / {unitLabel}</span>}
      </p>
      {favorite}
    </div>

    <CardLink className={styles.title} href={href}>
      {title || "Название объявления"}
    </CardLink>

    <p className={styles.author}>
      <span className={styles.meta}>{author}</span>
      <RatingLabel rating={rating} count={reviewsCount} />
    </p>
    <p className={styles.meta}>
      {place}
      {conditions && <br />}
      {conditions}
    </p>

    <div className={styles.action}>{action}</div>
  </article>
);

export default ListingCard;
