import { ARTICLE_SECTIONS, type ArticlePage, type ArticleSection } from "@/entities/article";
import { HOME_PATH } from "@/shared/config/routes";
import Breadcrumbs from "@/shared/ui/breadcrumbs";
import EmptyState from "@/shared/ui/empty-state";
import { FileTextIcon } from "@/shared/ui/icons";
import Title from "@/shared/ui/title";
import ArticleGrid from "./ui/article-grid";
import styles from "./style.module.scss";

export { loadArticlePage } from "./load";

type ArticleListProps = {
  section: ArticleSection;
  page: ArticlePage;
  pageNumber: number;
};

/** Раздел «Новости» или «Блог»: заголовок, карточки статей и «Загрузить ещё». */
const ArticleList = ({ section, page, pageNumber }: ArticleListProps) => {
  const meta = ARTICLE_SECTIONS[section];

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

      <ArticleGrid section={section} initial={page} pageNumber={pageNumber} />
    </div>
  );
};

export default ArticleList;
