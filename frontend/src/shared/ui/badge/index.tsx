import styles from "./style.module.scss";

type BadgeProps = {
  count: number;
};

/** Красный счётчик: непрочитанные сообщения, новые посты в подписках и т.п. */
const Badge = ({ count }: BadgeProps) => <span className={styles.badge}>{count}</span>;

export default Badge;
