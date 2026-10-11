"use client";

import { ARTICLE_SECTIONS, ArticleCard, type ArticlePage, type ArticleSection } from "@/entities/article";
import { offsetPath } from "@/shared/lib/pagination";
import LoadMore from "@/shared/ui/load-more";
import Notice from "@/shared/ui/notice";
import { ARTICLES_PAGE_SIZE } from "../../model/constants";
import { useArticleList } from "../../model/use-article-list";
import styles from "./style.module.scss";

type ArticleGridProps = {
  section: ArticleSection;
  initial: ArticlePage;
  pageNumber: number;
};

/** Сетка карточек статей и «Загрузить ещё» — ссылка на следующую страницу для поисковиков. */
const ArticleGrid = ({ section, initial, pageNumber }: ArticleGridProps) => {
  const list = useArticleList(section, initial, (pageNumber - 1) * ARTICLES_PAGE_SIZE);
  const nextHref = offsetPath(ARTICLE_SECTIONS[section].path, list.next, ARTICLES_PAGE_SIZE);

  return (
    <div className={styles.list}>
      <div className={styles.grid}>
        {list.page.items.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {list.error && <Notice tone="error">{list.error}</Notice>}

      {list.hasMore && (
        <LoadMore className={styles.more} href={nextHref} loading={list.loadingMore} onLoad={list.loadMore}>
          Загрузить ещё
        </LoadMore>
      )}
    </div>
  );
};

export default ArticleGrid;
