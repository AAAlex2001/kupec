import type { ReactNode } from "react";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

type SectionProps = {
  title: string;
  children: ReactNode;
};

/** Раздел страницы объявления: заголовок и содержимое. */
const Section = ({ title, children }: SectionProps) => (
  <section className={styles.section}>
    <Title>{title}</Title>
    {children}
  </section>
);

export default Section;
