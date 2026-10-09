"use client";

import cn from "classnames";
import { useState } from "react";
import { ChevronDownIcon } from "@/shared/ui/icons";
import { chainLabel, chainOf } from "../../lib/chains";
import type { CategoryNode } from "../../model/types";
import CategoryPicker from "../category-picker";
import styles from "./style.module.scss";

type CategorySelectProps = {
  id: string;
  tree: CategoryNode[];
  value: number | null;
  invalid?: boolean;
  onChange: (category: CategoryNode) => void;
};

/** Поле формы «Категория»: показывает путь, по нажатию открывает окно выбора конечной категории. */
const CategorySelect = ({ id, tree, value, invalid, onChange }: CategorySelectProps) => {
  const [open, setOpen] = useState(false);
  const label = chainLabel(chainOf(tree, value));

  return (
    <>
      <button
        id={id}
        type="button"
        className={cn(styles.field, invalid && styles.invalid)}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <span className={cn(styles.value, !label && styles.placeholder)}>
          {label || "Выберите категорию"}
        </span>
        <ChevronDownIcon className={styles.chevron} />
      </button>

      {open && (
        <CategoryPicker
          tree={tree}
          selectedId={value}
          leafOnly
          onSelect={(category) => {
            setOpen(false);
            onChange(category);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default CategorySelect;
