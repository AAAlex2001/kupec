"use client";

import cn from "classnames";
import Image from "next/image";
import { useRef } from "react";
import { usePhotoUpload, type UploadedPhoto } from "@/shared/lib/use-photo-upload";
import { PlusIcon } from "@/shared/ui/icons";
import Spinner from "@/shared/ui/spinner";
import styles from "./style.module.scss";

type PhotoPickerProps = {
  title: string;
  photos: UploadedPhoto[];
  max: number;
  error?: string;
  upload: (file: File) => Promise<UploadedPhoto>;
  remove: (id: number) => Promise<void>;
  onChange: (photos: UploadedPhoto[]) => void;
};

/** Фото в форме по 3 в ряд: превью с обложкой, удаление и плитка «Добавить фото». */
const PhotoPicker = ({ title, photos, max, error, upload, remove, onChange }: PhotoPickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploader = usePhotoUpload(photos, onChange, { max, upload, remove });
  const canAdd = photos.length + uploader.uploading < max;

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <p className={styles.title}>{title}</p>
        <p className={styles.hint}>
          {photos.length} из {max} · JPG, PNG или WebP · первое фото будет обложкой
        </p>
      </div>

      <div className={styles.grid}>
        {photos.map((photo, index) => (
          <div key={photo.id} className={styles.item}>
            <div className={styles.photo}>
              <Image className={styles.image} src={photo.url} alt="" fill sizes="200px" unoptimized />
            </div>

            <div className={styles.links}>
              {index === 0 ? (
                <span>Обложка</span>
              ) : (
                <button type="button" className={styles.link} onClick={() => uploader.makeCover(photo)}>
                  Сделать обложкой
                </button>
              )}
              <span aria-hidden="true">·</span>
              <button
                type="button"
                className={cn(styles.link, styles.danger)}
                onClick={() => uploader.remove(photo)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}

        {Array.from({ length: uploader.uploading }, (_, index) => (
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
          uploader.upload(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      {(error || uploader.error) && <p className={styles.error}>{uploader.error ?? error}</p>}
    </section>
  );
};

export default PhotoPicker;
