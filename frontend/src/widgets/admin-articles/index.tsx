"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ARTICLE_SECTION_TABS,
  fetchAdminArticles,
  type AdminArticle,
  type ArticleSection,
} from "@/entities/article";
import { adminArticlePath, NEW_ARTICLE_PATH } from "@/shared/config/routes";
import { errorMessage } from "@/shared/lib/errors";
import { formatDate } from "@/shared/lib/format";
import Button from "@/shared/ui/button";
import { PlusIcon } from "@/shared/ui/icons";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import Tabs from "@/shared/ui/tabs";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

/** Подпись состояния статьи в списке: черновик или дата публикации. */
const statusLabel = (article: AdminArticle) =>
  article.status === "published" && article.published_at
    ? `Опубликована ${formatDate(article.published_at)}`
    : "Черновик";

/** Админка «Статьи»: новости и блог по вкладкам, черновики вместе с опубликованными. */
const AdminArticles = () => {
  const [section, setSection] = useState<ArticleSection>("news");
  const [items, setItems] = useState<AdminArticle[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchAdminArticles(section)
      .then((page) => active && setItems(page.items))
      .catch((failure) => active && setError(errorMessage(failure, "Не удалось загрузить статьи")));

    return () => {
      active = false;
    };
  }, [section]);

  const changeSection = (value: string) => {
    setItems(null);
    setError(null);
    setSection(value as ArticleSection);
  };

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <Title as="h1">Статьи</Title>
        <Button href={NEW_ARTICLE_PATH}>
          <PlusIcon />
          Новая статья
        </Button>
      </div>

      <Tabs ariaLabel="Раздел" value={section} tabs={ARTICLE_SECTION_TABS} onChange={changeSection} />

      {error && <Notice tone="error">{error}</Notice>}
      {!items && !error && <Loader />}
      {items?.length === 0 && <p className={styles.empty}>В этом разделе пока нет статей.</p>}

      <ul className={styles.list}>
        {items?.map((article) => (
          <li key={article.id}>
            <Link className={styles.row} href={adminArticlePath(article.id)}>
              <span className={styles.title}>{article.title}</span>
              <span className={styles.meta}>
                {statusLabel(article)} · /{article.section}/{article.slug}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AdminArticles;
