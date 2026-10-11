"use client";

import { useState } from "react";
import { disconnectTelegram } from "@/entities/telegram";
import { errorMessage } from "@/shared/lib/errors";

/** Отключить Telegram и перечитать подключение. */
export const useDisconnectTelegram = (onDone: () => void) => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disconnect = async () => {
    setPending(true);
    setError(null);

    try {
      await disconnectTelegram();
      onDone();
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось отключить Telegram"));
    }

    setPending(false);
  };

  return { pending, error, disconnect };
};
