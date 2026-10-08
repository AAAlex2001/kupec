import Section from "../section";
import styles from "./style.module.scss";

type ListingDescriptionProps = {
  text: string;
};

/** Описание объявления с переносами строк, как их написал автор. */
const ListingDescription = ({ text }: ListingDescriptionProps) => (
  <Section title="Описание">
    <p className={styles.text}>{text}</p>
  </Section>
);

export default ListingDescription;
