"use client";

import cn from "classnames";
import Button from "@/shared/ui/button";
import { HeartIcon } from "@/shared/ui/icons";
import { useFavoriteToggle } from "../../model/use-favorite-toggle";
import styles from "./style.module.scss";

type FavoriteWideButtonProps = {
  listingId: number;
};

/** Кнопка «В избранное» на странице объявления. Сохранённое — с красным сердечком. */
const FavoriteWideButton = ({ listingId }: FavoriteWideButtonProps) => {
  const { active, onToggle } = useFavoriteToggle(listingId);

  return (
    <Button
      className={cn(active && styles.active)}
      variant="secondary"
      ariaPressed={active}
      onClick={onToggle}
    >
      <HeartIcon />
      {active ? "В избранном" : "В избранное"}
    </Button>
  );
};

export default FavoriteWideButton;
