"use client";

import { useState } from "react";
import type { AdminArticle } from "@/entities/article";
import { articlePath } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import ConfirmModal from "@/shared/ui/confirm-modal";
import { ExternalLinkIcon, TrashIcon } from "@/shared/ui/icons";
import type { ArticlePending } from "../../model/use-article-form";
import styles from "./style.module.scss";

type ArticleActionsProps = {
  article: AdminArticle | undefined;
  pending: ArticlePending;
  onSave: (publish: boolean) => void;
  onDelete: () => void;
};

/** Кнопки статьи: опубликовать или сохранить, черновик или снять с публикации, открыть на сайте, удалить. */
const ArticleActions = ({ article, pending, onSave, onDelete }: ArticleActionsProps) => {
  const [confirming, setConfirming] = useState(false);
  const published = article?.status === "published";
  const publishLabel = published ? "Сохранить" : "Опубликовать";
  const draftLabel = published ? "Снять с публикации" : "Сохранить черновик";
  const busy = pending !== null;

  return (
    <div className={styles.actions}>
      <div className={styles.main}>
        <Button loading={pending === "publish"} disabled={busy} onClick={() => onSave(true)}>
          {publishLabel}
        </Button>
        <Button
          variant="secondary"
          loading={pending === "draft"}
          disabled={busy}
          onClick={() => onSave(false)}
        >
          {draftLabel}
        </Button>
        {article && published && (
          <Button variant="ghost" href={articlePath(article.section, article.slug)}>
            <ExternalLinkIcon />
            Открыть на сайте
          </Button>
        )}
      </div>

      {article && (
        <Button variant="danger" disabled={busy} onClick={() => setConfirming(true)}>
          <TrashIcon />
          Удалить
        </Button>
      )}

      <ConfirmModal
        open={confirming}
        title="Удалить статью?"
        text="Статья пропадёт с сайта и из поиска. Вернуть её не получится."
        confirmLabel="Удалить"
        pending={pending === "delete"}
        onConfirm={onDelete}
        onClose={() => setConfirming(false)}
      />
    </div>
  );
};

export default ArticleActions;
