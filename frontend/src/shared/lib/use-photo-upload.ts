"use client";

import { useState } from "react";
import { errorMessage } from "@/shared/lib/errors";

export type UploadedPhoto = {
  id: number;
  url: string;
};

type PhotoApi = {
  max: number;
  upload: (file: File) => Promise<UploadedPhoto>;
  remove: (id: number) => Promise<void>;
};

/** Фото формы: загрузка по одному, удаление и выбор обложки. Первое фото — обложка.
 *
 * Фото, загруженное в этой форме, удаляется с сервера сразу. Уже сохранённое —
 * только убирается из формы: сервер удалит его при сохранении.
 */
export const usePhotoUpload = (
  photos: UploadedPhoto[],
  onChange: (photos: UploadedPhoto[]) => void,
  api: PhotoApi,
) => {
  const [uploading, setUploading] = useState(0);
  const [uploadedIds, setUploadedIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: File[]) => {
    const accepted = files.slice(0, api.max - photos.length);
    let current = photos;

    setError(files.length > accepted.length ? `Можно добавить не больше ${api.max} фото` : null);
    setUploading(accepted.length);

    for (const file of accepted) {
      try {
        const photo = await api.upload(file);
        current = [...current, photo];
        setUploadedIds((ids) => [...ids, photo.id]);
        onChange(current);
      } catch (failure) {
        setError(errorMessage(failure, "Не удалось загрузить фото"));
      } finally {
        setUploading((count) => count - 1);
      }
    }
  };

  const remove = async (photo: UploadedPhoto) => {
    onChange(photos.filter((item) => item.id !== photo.id));
    if (!uploadedIds.includes(photo.id)) return;

    try {
      await api.remove(photo.id);
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось удалить фото"));
    }
  };

  const makeCover = (photo: UploadedPhoto) =>
    onChange([photo, ...photos.filter((item) => item.id !== photo.id)]);

  return { uploading, error, upload, remove, makeCover };
};
