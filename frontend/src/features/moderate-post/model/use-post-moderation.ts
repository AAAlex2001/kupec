"use client";

import { useState } from "react";
import { errorMessage } from "@/shared/lib/errors";

/** Действие модератора: ждём ответа, показываем ошибку, после успеха — обновляем список. */
export const usePostModeration = (onDone: () => void) => {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<unknown>) => {
    setPending(true);
    setError(null);

    try {
      await action();
      setConfirming(false);
      onDone();
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось выполнить действие"));
    }

    setPending(false);
  };

  return { confirming, setConfirming, pending, error, run };
};
