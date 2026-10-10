import { ARTICLE_SECTIONS, ArticleCard, type ArticlePage, type ArticleSection } from "@/entities/article";
import { HOME_PATH } from "@/shared/config/routes";
import Breadcrumbs from "@/shared/ui/breadcrumbs";
import Button from "@/shared/ui/button";
import EmptyState from "@/shared/ui/empty-state";
import { FileTextIcon } from "@/shared/ui/icons";
import Title from "@/shared/ui/title";
import { ARTICLES_PAGE_SIZE } from "./load";
import styles from "./style.module.scss";

export { loadArticlePage } from "./load";

type ArticleListProps = {
  section: ArticleSection;
  page: ArticlePage;
  pageNumber: number;
};

/** Ссылка на страницу раздела: первая — без ?page, чтобы у неё был один адрес. */
const pageHref = (path: string, pageNumber: number) =>
  pageNumber > 1 ? `${path}?page=${pageNumber}` : path;

/** Раздел «Новости» или «Блог»: заголовок, карточки статей и переход по страницам. */
const ArticleList = ({ section, page, pageNumber }: ArticleListProps) => {
  const meta = ARTICLE_SECTIONS[section];
  const pageCount = Math.max(1, Math.ceil(page.total / ARTICLES_PAGE_SIZE));
  const hasPrevious = pageNumber > 1;
  const hasNext = pageNumber < pageCount;

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[{ label: "Главная", href: HOME_PATH }, { label: meta.title }]} />

      <div className={styles.head}>
        <Title as="h1">{meta.title}</Title>
        <p className={styles.lead}>{meta.lead}</p>
      </div>

      {page.items.length === 0 && (
        <EmptyState
          icon={<FileTextIcon />}
          title="Статей пока нет"
          text="Скоро здесь появятся первые материалы."
        />
      )}

      <div className={styles.grid}>
        {page.items.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {(hasPrevious || hasNext) && (
        <nav className={styles.pager} aria-label="Страницы раздела">
          {hasPrevious && (
            <Button variant="secondary" href={pageHref(meta.path, pageNumber - 1)}>
              Новее
            </Button>
          )}
          <span className={styles.position}>
            Страница {pageNumber} из {pageCount}
          </span>
          {hasNext && (
            <Button variant="secondary" href={pageHref(meta.path, pageNumber + 1)}>
              Старше
            </Button>
          )}
        </nav>
      )}
    </div>
  );
};

export default ArticleList;
