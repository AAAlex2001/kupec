import Image from "next/image";
import Link from "next/link";
import { articlePath } from "@/shared/config/routes";
import { formatDate } from "@/shared/lib/format";
import type { ArticleCard as ArticleCardData } from "../../model/types";
import ArticleStats from "../article-stats";
import styles from "./style.module.scss";

type ArticleCardProps = {
  article: ArticleCardData;
};

/** Карточка статьи в списке: обложка, дата, заголовок, анонс и счётчики внизу. Ведёт на статью. */
const ArticleCard = ({ article }: ArticleCardProps) => (
  <Link className={styles.card} href={articlePath(article.section, article.slug)}>
    {article.cover_url && (
      <div className={styles.cover}>
        <Image className={styles.image} src={article.cover_url} alt="" fill sizes="400px" unoptimized />
      </div>
    )}

    <div className={styles.body}>
      {article.published_at && (
        <time className={styles.date} dateTime={article.published_at}>
          {formatDate(article.published_at)}
        </time>
      )}
      <h2 className={styles.title}>{article.title}</h2>
      {article.description && <p className={styles.description}>{article.description}</p>}
    </div>

    <div className={styles.stats}>
      <ArticleStats article={article} />
    </div>
  </Link>
);

export default ArticleCard;
