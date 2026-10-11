"use client";

import { useState } from "react";
import { errorMessage } from "@/shared/lib/errors";

export const MAX_SUPPORT_PHOTOS = 5;

/** Черновик сообщения: текст и фото. После отправки очищается, при ошибке остаётся. */
export const useComposer = (onSend: (text: string, files: File[]) => Promise<void>) => {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const empty = text.trim() === "" && files.length === 0;

  const addFiles = (picked: File[]) => setFiles([...files, ...picked].slice(0, MAX_SUPPORT_PHOTOS));

  const removeFile = (index: number) => setFiles(files.filter((_, current) => current !== index));

  const send = async () => {
    if (empty || pending) return;

    setPending(true);
    setError(null);

    try {
      await onSend(text.trim(), files);
      setText("");
      setFiles([]);
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось отправить сообщение"));
    }

    setPending(false);
  };

  return { text, setText, files, addFiles, removeFile, pending, error, empty, send };
};
