"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { removeCategoryImage, uploadCategoryImage, type AdminCategory } from "@/entities/category";
import { errorMessage } from "@/shared/lib/errors";
import Button from "@/shared/ui/button";
import styles from "./style.module.scss";

type CategoryImageProps = {
  category: AdminCategory;
  onChanged: () => void;
};

/** Картинка плитки: загрузка и удаление сразу, без кнопки «Сохранить». */
const CategoryImage = ({ category, onChanged }: CategoryImageProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(category.image_url ?? null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<{ image_url?: string | null }>) => {
    setPending(true);
    setError(null);

    try {
      const updated = await action();
      setImageUrl(updated.image_url ?? null);
      onChanged();
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось изменить картинку"));
    }

    setPending(false);
  };

  return (
    <div className={styles.image}>
      <p className={styles.label}>Картинка плитки</p>

      <div className={styles.row}>
        <div className={styles.preview}>
          {imageUrl && <Image src={imageUrl} alt="" fill sizes="96px" unoptimized />}
        </div>

        <div className={styles.buttons}>
          <Button variant="secondary" loading={pending} onClick={() => inputRef.current?.click()}>
            {imageUrl ? "Заменить" : "Загрузить"}
          </Button>
          {imageUrl && (
            <Button
              variant="ghost"
              disabled={pending}
              onClick={() => run(() => removeCategoryImage(category.id))}
            >
              Убрать
            </Button>
          )}
        </div>
      </div>

      <p className={styles.hint}>PNG или WebP с прозрачным фоном, примерно 320×224</p>
      {error && <p className={styles.error}>{error}</p>}

      <input
        ref={inputRef}
        className={styles.file}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) run(() => uploadCategoryImage(category.id, file));
        }}
      />
    </div>
  );
};

export default CategoryImage;
