"use client";

import { useState } from "react";
import { deleteListingPhoto, uploadListingPhoto, type ListingPhoto } from "@/entities/listing";
import { errorMessage } from "@/shared/lib/errors";

export const MAX_PHOTOS = 10;

/** Фото объявления: загрузка по одному, удаление и выбор обложки. Первое фото — обложка. */
export const usePhotoUpload = (
  photos: ListingPhoto[],
  onChange: (photos: ListingPhoto[]) => void,
) => {
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: File[]) => {
    const accepted = files.slice(0, MAX_PHOTOS - photos.length);
    let current = photos;

    setError(files.length > accepted.length ? `Можно добавить не больше ${MAX_PHOTOS} фото` : null);
    setUploading(accepted.length);

    for (const file of accepted) {
      try {
        current = [...current, await uploadListingPhoto(file)];
        onChange(current);
      } catch (failure) {
        setError(errorMessage(failure, "Не удалось загрузить фото"));
      } finally {
        setUploading((count) => count - 1);
      }
    }
  };

  const remove = async (photo: ListingPhoto) => {
    onChange(photos.filter((item) => item.id !== photo.id));
    await deleteListingPhoto(photo.id).catch(() => undefined);
  };

  const makeCover = (photo: ListingPhoto) =>
    onChange([photo, ...photos.filter((item) => item.id !== photo.id)]);

  return { uploading, error, upload, remove, makeCover };
};
