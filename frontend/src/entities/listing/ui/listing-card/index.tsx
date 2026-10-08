import cn from "classnames";
import Image from "next/image";
import type { ReactNode } from "react";
import { formatRub } from "@/shared/lib/format";
import Button from "@/shared/ui/button";
import { HeartIcon, MessageCircleMoreIcon } from "@/shared/ui/icons";
import CardLink from "../card-link";
import styles from "./style.module.scss";

type ListingCardProps = {
  photoUrl: string | null;
  price: string | null;
  unitLabel: string | null;
  title: string;
  author: string;
  place: string;
  conditions: string;
  href?: string;
  favorite?: ReactNode;
  action?: ReactNode;
  flat?: boolean;
};

const DEFAULT_FAVORITE = <HeartIcon className={styles.heart} />;

const DEFAULT_ACTION = (
  <Button variant="secondary">
    <MessageCircleMoreIcon />
    Написать
  </Button>
);

/** Карточка объявления. Сердечко и кнопку подставляют снаружи. flat — без белой подложки. */
const ListingCard = ({
  photoUrl,
  price,
  unitLabel,
  title,
  author,
  place,
  conditions,
  href,
  favorite = DEFAULT_FAVORITE,
  action = DEFAULT_ACTION,
  flat,
}: ListingCardProps) => (
  <article className={cn(styles.card, flat && styles.flat)}>
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

    <p className={styles.meta}>{author}</p>
    <p className={styles.meta}>
      {place}
      {conditions && <br />}
      {conditions}
    </p>

    <div className={styles.action}>{action}</div>
  </article>
);

export default ListingCard;
