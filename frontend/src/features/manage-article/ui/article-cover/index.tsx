"use client";

import Image from "next/image";
import { useRef } from "react";
import type { AdminArticle } from "@/entities/article";
import Button from "@/shared/ui/button";
import { ImageIcon, TrashIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

type ArticleCoverProps = {
  article: AdminArticle | undefined;
  pending: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
};

/** Обложка статьи: превью, загрузка и удаление. У новой статьи — подсказка сначала сохранить. */
const ArticleCover = ({ article, pending, onUpload, onRemove }: ArticleCoverProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  if (!article) {
    return (
      <section className={styles.cover}>
        <p className={styles.title}>Обложка</p>
        <p className={styles.hint}>Обложку можно добавить после первого сохранения статьи.</p>
      </section>
    );
  }

  return (
    <section className={styles.cover}>
      <p className={styles.title}>Обложка</p>

      {article.cover_url && (
        <div className={styles.preview}>
          <Image src={article.cover_url} alt="" fill sizes="480px" unoptimized />
        </div>
      )}

      <p className={styles.hint}>JPG, PNG или WebP до 10 МБ, лучше горизонтальная 16:9.</p>

      <div className={styles.buttons}>
        <Button variant="secondary" loading={pending} onClick={() => inputRef.current?.click()}>
          <ImageIcon />
          Загрузить обложку
        </Button>
        {article.cover_url && (
          <Button variant="danger" disabled={pending} onClick={onRemove}>
            <TrashIcon />
            Убрать
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        className={styles.file}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onUpload(file);
        }}
      />
    </section>
  );
};

export default ArticleCover;
