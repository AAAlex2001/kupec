"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/shared/lib/errors";
import { fetchConversation } from "../api/conversations";
import type { ConversationDetail, Message } from "./types";

const REFRESH_MS = 5_000;

/** Открытая переписка: обновляется раз в 5 секунд, чтобы приходили новые сообщения. */
export const useConversation = (id: number) => {
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;

    const load = () =>
      fetchConversation(id)
        .then((found) => active && setDetail(found))
        .catch((failure) => active && setError(errorMessage(failure, "Не удалось открыть")));

    load();
    const interval = setInterval(load, REFRESH_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [id, version]);

  const addMessage = (message: Message) =>
    setDetail((current) => current && { ...current, messages: [...current.messages, message] });

  const reload = () => setVersion((value) => value + 1);

  return { detail, error, addMessage, reload };
};
