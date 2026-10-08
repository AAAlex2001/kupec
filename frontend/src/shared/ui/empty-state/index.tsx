import type { ReactNode } from "react";
import styles from "./style.module.scss";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  text: string;
  action?: ReactNode;
};

/** Пустой раздел: иконка, заголовок, пояснение и кнопка следующего шага. */
const EmptyState = ({ icon, title, text, action }: EmptyStateProps) => (
  <div className={styles.empty}>
    <span className={styles.icon}>{icon}</span>
    <p className={styles.title}>{title}</p>
    <p className={styles.text}>{text}</p>
    {action}
  </div>
);

export default EmptyState;
