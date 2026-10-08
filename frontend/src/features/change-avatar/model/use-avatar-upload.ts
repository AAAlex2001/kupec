"use client";

import { useState } from "react";
import { uploadAvatar, useUser } from "@/entities/user";
import { errorMessage } from "@/shared/lib/errors";

/** Загрузка нового фото профиля сразу после выбора файла. */
export const useAvatarUpload = () => {
  const { setUser } = useUser();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setPending(true);
    setError(null);

    try {
      setUser(await uploadAvatar(file));
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось загрузить фото"));
    } finally {
      setPending(false);
    }
  };

  return { pending, error, upload };
};
