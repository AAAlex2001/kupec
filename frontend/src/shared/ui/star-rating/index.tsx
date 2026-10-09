"use client";

import cn from "classnames";
import { useState } from "react";
import { StarIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  invalid?: boolean;
};

const LABELS = ["Плохо", "Так себе", "Нормально", "Хорошо", "Отлично"];

/** Выбор оценки звёздами: при наведении подсвечиваются. */
const StarRating = ({ value, onChange, invalid }: StarRatingProps) => {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <div className={styles.stars} role="radiogroup" aria-label="Оценка" onMouseLeave={() => setHovered(0)}>
      {LABELS.map((label, index) => (
        <button
          key={label}
          type="button"
          role="radio"
          aria-checked={value === index + 1}
          aria-label={label}
          className={cn(styles.star, index < shown && styles.filled, invalid && styles.invalid)}
          onMouseEnter={() => setHovered(index + 1)}
          onClick={() => onChange(index + 1)}
        >
          <StarIcon />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
