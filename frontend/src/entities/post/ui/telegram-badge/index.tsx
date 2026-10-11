import { TelegramIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

type TelegramBadgeProps = {
  url: string;
};

/** Плашка «Опубликовано в Telegram» со ссылкой на пост в канале автора. */
const TelegramBadge = ({ url }: TelegramBadgeProps) => (
  <a className={styles.badge} href={url} target="_blank" rel="noopener noreferrer">
    <TelegramIcon className={styles.icon} />
    <span className={styles.long}>Опубликовано в&nbsp;</span>
    Telegram
  </a>
);

export default TelegramBadge;
