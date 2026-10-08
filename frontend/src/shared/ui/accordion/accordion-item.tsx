"use client";

import cn from "classnames";
import { useId, useState } from "react";
import { ChevronDownIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

type AccordionItemProps = {
  title: string;
  text: string;
};

/** Пункт аккордеона: заголовок-кнопка и текст, который плавно раскрывается. */
const AccordionItem = ({ title, text }: AccordionItemProps) => {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={cn(styles.item, open && styles.open)}>
      <button
        type="button"
        className={styles.title}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        {title}
        <ChevronDownIcon className={styles.chevron} />
      </button>

      <div id={panelId} className={styles.panel} role="region">
        <div className={styles.inner}>
          <p className={styles.text}>{text}</p>
        </div>
      </div>
    </div>
  );
};

export default AccordionItem;
