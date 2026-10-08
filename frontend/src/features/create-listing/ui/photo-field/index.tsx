"use client";

import cn from "classnames";
import Image from "next/image";
import { useRef } from "react";
import type { ListingPhoto } from "@/entities/listing";
import { PlusIcon } from "@/shared/ui/icons";
import Spinner from "@/shared/ui/spinner";
import { MAX_PHOTOS, usePhotoUpload } from "../../model/use-photo-upload";
import styles from "./style.module.scss";

type PhotoFieldProps = {
  photos: ListingPhoto[];
  error?: string;
  onChange: (photos: ListingPhoto[]) => void;
};

/** Фото объявления: превью с обложкой, удаление и плитка «Добавить фото». */
const PhotoField = ({ photos, error, onChange }: PhotoFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploading, error: uploadError, upload, remove, makeCover } = usePhotoUpload(
    photos,
    onChange,
  );
  const canAdd = photos.length + uploading < MAX_PHOTOS;

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <p className={styles.title}>Фотографии *</p>
        <p className={styles.hint}>До {MAX_PHOTOS} фото · JPG, PNG · первое фото будет обложкой</p>
      </div>

      <div className={styles.grid}>
        {photos.map((photo, index) => (
          <div key={photo.id} className={styles.item}>
            <div className={styles.photo}>
              <Image className={styles.image} src={photo.url} alt="" fill sizes="144px" unoptimized />
            </div>

            <div className={styles.links}>
              {index === 0 ? (
                <span>Обложка</span>
              ) : (
                <button type="button" className={styles.link} onClick={() => makeCover(photo)}>
                  Сделать обложкой
                </button>
              )}
              <span aria-hidden="true">·</span>
              <button
                type="button"
                className={cn(styles.link, styles.danger)}
                onClick={() => remove(photo)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}

        {Array.from({ length: uploading }, (_, index) => (
          <div key={`uploading-${index}`} className={styles.tile} role="status" aria-label="Загрузка фото">
            <Spinner />
          </div>
        ))}

        {canAdd && (
          <button type="button" className={styles.tile} onClick={() => inputRef.current?.click()}>
            <PlusIcon />
            Добавить фото
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        className={styles.file}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(event) => {
          upload(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      {(error || uploadError) && <p className={styles.error}>{uploadError ?? error}</p>}
    </section>
  );
};

export default PhotoField;
