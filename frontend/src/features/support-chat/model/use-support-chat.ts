"use client";

import { useEffect, useState } from "react";
import { fetchSupportThread, sendSupportMessage, type SupportMessage } from "@/entities/support";
import { errorMessage } from "@/shared/lib/errors";

const REFRESH_MS = 5_000;

/** Переписка с поддержкой, пока чат открыт: обновляется раз в 5 секунд, новое сообщение сразу в ленте. */
export const useSupportChat = () => {
  const [messages, setMessages] = useState<SupportMessage[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = () =>
      fetchSupportThread()
        .then((thread) => active && setMessages(thread.messages))
        .catch((failure) => active && setError(errorMessage(failure, "Не удалось загрузить переписку")));

    load();
    const interval = setInterval(load, REFRESH_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const send = async (text: string, files: File[]) => {
    const message = await sendSupportMessage(text, files);
    setMessages((current) => [...(current ?? []), message]);
  };

  return { messages, error, send };
};
