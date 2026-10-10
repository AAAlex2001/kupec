"use client";

import { useEffect, useState } from "react";
import { fetchAdminArticle, type AdminArticle } from "@/entities/article";
import { ArticleForm } from "@/features/manage-article";
import { ADMIN_ARTICLES_PATH } from "@/shared/config/routes";
import { errorMessage } from "@/shared/lib/errors";
import Breadcrumbs from "@/shared/ui/breadcrumbs";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

type ArticleEditorProps = {
  articleId?: number;
};

/** Редактор статьи в админке: новая — сразу форма, существующая — после загрузки. */
const ArticleEditor = ({ articleId }: ArticleEditorProps) => {
  const [article, setArticle] = useState<AdminArticle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const heading = articleId ? "Редактирование статьи" : "Новая статья";

  useEffect(() => {
    if (!articleId) return;

    let active = true;

    fetchAdminArticle(articleId)
      .then((found) => active && setArticle(found))
      .catch((failure) => active && setError(errorMessage(failure, "Не удалось загрузить статью")));

    return () => {
      active = false;
    };
  }, [articleId]);

  const ready = !articleId || article;

  return (
    <section className={styles.editor}>
      <Breadcrumbs items={[{ label: "Статьи", href: ADMIN_ARTICLES_PATH }, { label: heading }]} />
      <Title as="h1">{heading}</Title>

      {error && <Notice tone="error">{error}</Notice>}
      {!ready && !error && <Loader />}
      {ready && <ArticleForm key={article?.id ?? "new"} article={article ?? undefined} />}
    </section>
  );
};

export default ArticleEditor;
