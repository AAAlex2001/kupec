import { StarIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

type RatingLabelProps = {
  rating: number;
  count: number;
};

const RATING = new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Рейтинг коротко: «★ 4,9 (18)». Без отзывов ничего не показывает. */
const RatingLabel = ({ rating, count }: RatingLabelProps) => {
  if (count === 0) return null;

  return (
    <span className={styles.rating}>
      <StarIcon className={styles.star} />
      {RATING.format(rating)} ({count})
    </span>
  );
};

export default RatingLabel;
