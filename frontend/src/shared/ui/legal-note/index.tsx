import type { ReactNode } from "react";
import styles from "./style.module.scss";

type LegalNoteProps = {
  children: ReactNode;
};

/** Мелкий текст согласия на серой плашке: ссылки на документы — синие, без подчёркивания. */
const LegalNote = ({ children }: LegalNoteProps) => <p className={styles.note}>{children}</p>;

export default LegalNote;
