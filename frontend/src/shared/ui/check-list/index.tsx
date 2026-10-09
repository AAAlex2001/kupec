"use client";

import { useState } from "react";
import Checkbox from "@/shared/ui/checkbox";
import styles from "./style.module.scss";

type CheckOption = {
  value: string;
  label: string;
};

type CheckListProps = {
  options: CheckOption[];
  values: string[];
  onChange: (values: string[]) => void;
  limit?: number;
};

/** Несколько вариантов флажками. Длинный список свёрнут до limit с «Показать ещё». */
const CheckList = ({ options, values, onChange, limit }: CheckListProps) => {
  const [expanded, setExpanded] = useState(false);
  const collapsed = limit !== undefined && !expanded && options.length > limit;
  const shown = collapsed ? options.slice(0, limit) : options;

  const toggle = (value: string, checked: boolean) =>
    onChange(
      options
        .map((option) => option.value)
        .filter((item) => (item === value ? checked : values.includes(item))),
    );

  return (
    <div className={styles.list}>
      {shown.map((option) => (
        <Checkbox
          key={option.value}
          checked={values.includes(option.value)}
          onChange={(checked) => toggle(option.value, checked)}
        >
          {option.label}
        </Checkbox>
      ))}

      {collapsed && (
        <button type="button" className={styles.more} onClick={() => setExpanded(true)}>
          Показать ещё
        </button>
      )}
    </div>
  );
};

export default CheckList;
