import cn from "classnames";
import Badge from "@/shared/ui/badge";
import styles from "./style.module.scss";

type Tab = {
  value: string;
  label: string;
  count?: number;
  badge?: number;
};

type TabsProps = {
  value: string;
  tabs: Tab[];
  onChange: (value: string) => void;
  ariaLabel: string;
};

/** Подпись вкладки со счётчиком через точку: «Все · 6». */
const tabLabel = (tab: Tab) => (tab.count === undefined ? tab.label : `${tab.label} · ${tab.count}`);

/** Вкладки с подчёркиванием активной. Шириной по содержимому. badge — красный счётчик нового. */
const Tabs = ({ value, tabs, onChange, ariaLabel }: TabsProps) => (
  <div className={styles.tabs} role="tablist" aria-label={ariaLabel}>
    {tabs.map((tab) => (
      <button
        key={tab.value}
        type="button"
        role="tab"
        aria-selected={tab.value === value}
        className={cn(styles.tab, tab.value === value && styles.active)}
        onClick={() => onChange(tab.value)}
      >
        {tabLabel(tab)}
        {tab.badge ? <Badge count={tab.badge} /> : null}
      </button>
    ))}
  </div>
);

export default Tabs;
