"use client";

import cn from "classnames";
import { HeartIcon } from "@/shared/ui/icons";
import { useFavoriteToggle } from "../../model/use-favorite-toggle";
import styles from "./style.module.scss";

type FavoriteButtonProps = {
  listingId: number;
};

/** Сердечко «В избранное» в карточке: красное, когда объявление сохранено. */
const FavoriteButton = ({ listingId }: FavoriteButtonProps) => {
  const { active, onToggle } = useFavoriteToggle(listingId);

  return (
    <button
      type="button"
      className={cn(styles.heart, active && styles.active)}
      aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
      aria-pressed={active}
      onClick={onToggle}
    >
      <HeartIcon />
    </button>
  );
};

export default FavoriteButton;
