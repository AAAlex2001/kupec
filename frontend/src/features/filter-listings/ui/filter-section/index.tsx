import type { ReactNode } from "react";
import styles from "./style.module.scss";

type FilterSectionProps = {
  title: string;
  children: ReactNode;
};

/** Блок панели фильтров: заголовок и поля. */
const FilterSection = ({ title, children }: FilterSectionProps) => (
  <fieldset className={styles.section}>
    <legend className={styles.title}>{title}</legend>
    {children}
  </fieldset>
);

export default FilterSection;
