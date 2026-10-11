"use client";

import { useId } from "react";
import Dropdown from "@/shared/ui/dropdown";
import { isThemePreference } from "@/shared/lib/theme/config";
import { setThemePreference, useThemePreference } from "@/shared/lib/theme/store";
import styles from "./style.module.scss";

const options = [
  { value: "light", label: "Светлая" },
  { value: "dark", label: "Тёмная" },
];

/** Выбор темы оформления в настройках профиля. */
const ThemeSelect = () => {
  const id = useId();
  const preference = useThemePreference();

  return (
    <div className={styles.control}>
      <label className={styles.label} htmlFor={id}>
        Тема оформления
      </label>
      <Dropdown
        id={id}
        value={preference}
        options={options}
        placeholder="Светлая"
        onChange={(value) => {
          if (isThemePreference(value)) setThemePreference(value);
        }}
      />
    </div>
  );
};

export default ThemeSelect;
