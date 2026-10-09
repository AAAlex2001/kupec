import cn from "classnames";
import { StarIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

type StarsProps = {
  rating: number;
  size?: "sm" | "md";
};

const STARS = [1, 2, 3, 4, 5];

/** Оценка звёздами: закрашено столько звёзд, сколько баллов. */
const Stars = ({ rating, size = "md" }: StarsProps) => (
  <span className={cn(styles.stars, styles[size])} aria-label={`Оценка ${rating} из 5`} role="img">
    {STARS.map((star) => (
      <StarIcon key={star} className={cn(styles.star, star <= Math.round(rating) && styles.filled)} />
    ))}
  </span>
);

export default Stars;
