"use client";

import { useRef } from "react";
import { usePhotoUpload, type UploadedPhoto } from "@/shared/lib/use-photo-upload";
import Button from "@/shared/ui/button";
import CloseButton from "@/shared/ui/close-button";
import { ImageIcon } from "@/shared/ui/icons";
import MediaView from "@/shared/ui/media-view";
import Spinner from "@/shared/ui/spinner";
import styles from "./style.module.scss";

type MediaPickerProps = {
  title: string;
  files: UploadedPhoto[];
  max: number;
  upload: (file: File) => Promise<UploadedPhoto>;
  remove: (id: number) => Promise<void>;
  onChange: (files: UploadedPhoto[]) => void;
};

/** Фото и видео в форме по 3 в ряд с крестиком удаления и кнопкой «Добавить фото или видео». */
const MediaPicker = ({ title, files, max, upload, remove, onChange }: MediaPickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploader = usePhotoUpload(files, onChange, { max, upload, remove });
  const canAdd = files.length + uploader.uploading < max;

  return (
    <section className={styles.section}>
      <p className={styles.title}>{title}</p>

      <div className={styles.grid}>
        {files.map((file) => (
          <div key={file.id} className={styles.tile}>
            <MediaView url={file.url} video={file.url.endsWith(".mp4")} />
            <CloseButton
              className={styles.remove}
              dark
              ariaLabel="Удалить"
              onClick={() => uploader.remove(file)}
            />
          </div>
        ))}

        {Array.from({ length: uploader.uploading }, (_, index) => (
          <div key={`uploading-${index}`} className={styles.tile} role="status" aria-label="Загрузка">
            <Spinner />
          </div>
        ))}
      </div>

      {canAdd && (
        <Button variant="secondary" onClick={() => inputRef.current?.click()}>
          <ImageIcon />
          Добавить фото или видео
        </Button>
      )}

      <input
        ref={inputRef}
        className={styles.file}
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,.jpg,.jpeg,.png,.webp,.mp4,.mov"
        multiple
        onChange={(event) => {
          uploader.upload(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      {uploader.error && <p className={styles.error}>{uploader.error}</p>}
    </section>
  );
};

export default MediaPicker;
