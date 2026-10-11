"use client";

import { ArticleCard, type ArticlePage, type ArticleSection } from "@/entities/article";
import Button from "@/shared/ui/button";
import Notice from "@/shared/ui/notice";
import { useArticleList } from "../../model/use-article-list";
import styles from "./style.module.scss";

type ArticleGridProps = {
  section: ArticleSection;
  initial: ArticlePage;
};

/** Сетка карточек статей и «Загрузить ещё», пока есть что подгружать. */
const ArticleGrid = ({ section, initial }: ArticleGridProps) => {
  const { page, loadingMore, error, loadMore } = useArticleList(section, initial);

  return (
    <div className={styles.list}>
      <div className={styles.grid}>
        {page.items.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      {page.items.length < page.total && (
        <Button className={styles.more} variant="primary" loading={loadingMore} onClick={loadMore}>
          Загрузить ещё
        </Button>
      )}
    </div>
  );
};

export default ArticleGrid;
