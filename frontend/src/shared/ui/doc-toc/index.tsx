"use client";

import { useId, useState } from "react";
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
const DocToc = ({ items, title = "Содержание" }: DocTocProps) => {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();

  return (
    <nav className={styles.contents} aria-label={title}>
      <p className={styles.title}>{title}</p>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={expanded}
        aria-controls={listId}
        onClick={() => setExpanded((value) => !value)}
      >
        {title}
        <span className={styles.arrow} aria-hidden="true" />
      </button>

      <div
        id={listId}
        className={`${styles.list} ${expanded ? styles.expanded : ""}`}
      >
        {items.map(({ id, title: label }) => (
          <a key={id} className={styles.link} href={`#${id}`}>
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
};

export default DocToc;
