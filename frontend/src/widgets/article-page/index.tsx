import Image from "next/image";
import {
  ARTICLE_SECTIONS,
  ArticleCard,
  articleJsonLd,
  type Article,
  type ArticleCardData,
} from "@/entities/article";
import { ArticleReactions } from "@/features/react-article";
import { COMMENTS_ANCHOR, HOME_PATH } from "@/shared/config/routes";
import { formatDate } from "@/shared/lib/format";
import Breadcrumbs from "@/shared/ui/breadcrumbs";
import JsonLd from "@/shared/ui/json-ld";
import Title from "@/shared/ui/title";
import Comments from "@/widgets/comments";
import styles from "./style.module.scss";

export { loadRelated } from "./load";

type ArticlePageProps = {
  article: Article;
  related: ArticleCardData[];
};

/** Статья: путь по разделам, заголовок, дата, обложка, текст и «Читайте также». Разметка schema.org — для поисковиков. */
const ArticlePage = ({ article, related }: ArticlePageProps) => {
  const section = ARTICLE_SECTIONS[article.section];

  return (
    <div className={styles.page}>
      <JsonLd data={articleJsonLd(article)} />

      <Breadcrumbs
        items={[
          { label: "Главная", href: HOME_PATH },
          { label: section.title, href: section.path },
          { label: article.title },
        ]}
      />

      <article className={styles.article}>
        <header className={styles.head}>
          <Title as="h1">{article.title}</Title>
          {article.published_at && (
            <time className={styles.date} dateTime={article.published_at}>
              {formatDate(article.published_at)}
            </time>
          )}
        </header>

        {article.cover_url && (
          <div className={styles.cover}>
            <Image src={article.cover_url} alt="" fill sizes="(min-width: 1440px) 720px, 100vw" unoptimized />
          </div>
        )}

        {article.description && <p className={styles.lead}>{article.description}</p>}

        <div className={styles.text} dangerouslySetInnerHTML={{ __html: article.html }} />
        <ArticleReactions key={article.id} article={article} commentsHref={`#${COMMENTS_ANCHOR}`} />
      </article>

      <div className={styles.discussion}>
        <Comments
          key={article.id}
          id={COMMENTS_ANCHOR}
          target={{ kind: "articles", id: article.id }}
          count={article.comments_count}
        />
      </div>

      {related.length > 0 && (
        <section className={styles.related} aria-labelledby="related-title">
          <h2 id="related-title" className={styles.relatedTitle}>
            Читайте также
          </h2>
          <div className={styles.grid}>
            {related.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ArticlePage;
