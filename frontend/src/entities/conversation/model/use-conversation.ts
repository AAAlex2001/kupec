"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/shared/lib/errors";
import { fetchConversation } from "../api/conversations";
import { notifyRead } from "./read-event";
import type { ConversationDetail, Message } from "./types";

const REFRESH_MS = 5_000;

/** Открытая переписка: обновляется раз в 5 секунд, после загрузки сообщения считаются прочитанными. */
export const useConversation = (id: number) => {
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;

    const load = () =>
      fetchConversation(id)
        .then((found) => {
          if (!active) return;
          setDetail(found);
          notifyRead();
        })
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
