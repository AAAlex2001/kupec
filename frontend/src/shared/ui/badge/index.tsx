import styles from "./style.module.scss";

type BadgeProps = {
  count: number;
};

/** Синий счётчик: непрочитанные сообщения и т.п. */
const Badge = ({ count }: BadgeProps) => <span className={styles.badge}>{count}</span>;

export default Badge;
