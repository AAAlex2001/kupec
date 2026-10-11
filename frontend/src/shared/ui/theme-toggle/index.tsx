"use client";

import { setThemePreference, useThemePreference } from "@/shared/lib/theme/store";
import { DayIcon, NightIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

/** Переключатель светлой и тёмной темы. Нужную иконку выбирает CSS, поэтому она верная с первой отрисовки. */
const ThemeToggle = () => {
  const dark = useThemePreference() === "dark";
  const title = dark ? "Включить светлую тему" : "Включить тёмную тему";

  return (
    <button
      type="button"
      className={styles.toggle}
      role="switch"
      aria-checked={dark}
      aria-label="Тема оформления: тёмная"
      title={title}
      onClick={() => setThemePreference(dark ? "light" : "dark")}
    >
      <span className={styles.icon} aria-hidden="true">
        <DayIcon className={styles.sun} />
        <NightIcon className={styles.moon} />
      </span>
      <span className={styles.label}>Тема оформления</span>
    </button>
  );
};

export default ThemeToggle;
