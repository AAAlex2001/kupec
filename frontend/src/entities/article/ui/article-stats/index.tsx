import { EyeIcon, HeartIcon, MessageCircleIcon } from "@/shared/ui/icons";
import type { ArticleCard } from "../../model/types";
import styles from "./style.module.scss";

type ArticleStatsProps = {
  article: ArticleCard;
};

/** Счётчики статьи без действий: лайки, комментарии и просмотры. */
const ArticleStats = ({ article }: ArticleStatsProps) => (
  <ul className={styles.stats}>
    <li className={styles.stat} title="Лайки">
      <HeartIcon className={styles.icon} />
      {article.likes_count}
    </li>
    <li className={styles.stat} title="Комментарии">
      <MessageCircleIcon className={styles.icon} />
      {article.comments_count}
    </li>
    <li className={styles.stat} title="Просмотры">
      <EyeIcon className={styles.icon} />
      {article.views_count}
    </li>
  </ul>
);

export default ArticleStats;
