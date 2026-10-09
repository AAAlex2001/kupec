"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/shared/lib/errors";
import { fetchConversations } from "../api/conversations";
import { onRead } from "./read-event";
import type { Conversation } from "./types";

const REFRESH_MS = 10_000;

const SEARCH_DELAY_MS = 300;

/** Список переписок: обновляется раз в 10 секунд, при поиске и после прочтения переписки. */
export const useConversations = (query: string) => {
  const [items, setItems] = useState<Conversation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = () =>
      fetchConversations(query)
        .then((found) => active && setItems(found))
        .catch((failure) => active && setError(errorMessage(failure, "Не удалось загрузить")));

    const timer = setTimeout(load, query ? SEARCH_DELAY_MS : 0);
    const interval = setInterval(load, REFRESH_MS);
    const unsubscribe = onRead(load);

    return () => {
      active = false;
      clearTimeout(timer);
      clearInterval(interval);
      unsubscribe();
    };
  }, [query]);

  return { items, error };
};
