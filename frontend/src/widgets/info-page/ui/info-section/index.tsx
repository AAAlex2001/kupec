import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import type { InfoSection as Section } from "../../model/types";
import styles from "./style.module.scss";

type InfoSectionProps = {
  section: Section;
};

/** Раздел страницы: заголовок, вступление, пункты по порядку и подсказка. */
const InfoSection = ({ section }: InfoSectionProps) => (
  <section id={section.id} className={styles.section}>
    <Title>{section.title}</Title>
    <p className={styles.intro}>{section.intro}</p>

    <ol className={styles.steps}>
      {section.steps.map((step) => (
        <li key={step} className={styles.step}>
          {step}
        </li>
      ))}
    </ol>

    {section.tip && <Notice tone="info">{section.tip}</Notice>}
  </section>
);

export default InfoSection;
