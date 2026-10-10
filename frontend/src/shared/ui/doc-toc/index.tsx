import styles from "./style.module.scss";

export type DocTocItem = {
  id: string;
  title: string;
};

type DocTocProps = {
  items: DocTocItem[];
  title?: string;
};

/** Общее содержание текстовых страниц со ссылками на разделы. */
const DocToc = ({ items, title = "Содержание" }: DocTocProps) => (
  <nav className={styles.contents} aria-label={title}>
    <p className={styles.title}>{title}</p>

    {items.map(({ id, title: label }) => (
      <a key={id} className={styles.link} href={`#${id}`}>
        {label}
      </a>
    ))}
  </nav>
);

export default DocToc;
