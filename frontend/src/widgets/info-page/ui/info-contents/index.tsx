import type { InfoSection } from "../../model/types";
import styles from "./style.module.scss";

type InfoContentsProps = {
  sections: InfoSection[];
};

/** Оглавление: ссылки на разделы страницы и частые вопросы. */
const InfoContents = ({ sections }: InfoContentsProps) => (
  <nav className={styles.contents} aria-label="Разделы страницы">
    <p className={styles.title}>Разделы</p>

    {sections.map(({ id, title }) => (
      <a key={id} className={styles.link} href={`#${id}`}>
        {title}
      </a>
    ))}

    <a className={styles.link} href="#faq">
      Частые вопросы
    </a>
  </nav>
);

export default InfoContents;
