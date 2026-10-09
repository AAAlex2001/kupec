"use client";

import { useEffect, useState } from "react";
import { reportError } from "@/shared/lib/report-error";
import { fetchUnreadCount } from "../api/conversations";
import { onRead } from "./read-event";

const REFRESH_MS = 15_000;

/** Сколько всего непрочитанных сообщений. Обновляется раз в 15 секунд и сразу после прочтения переписки. */
export const useUnreadCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;

    const load = () =>
      fetchUnreadCount()
        .then((unread) => active && setCount(unread.count))
        .catch(reportError);

    load();
    const interval = setInterval(load, REFRESH_MS);
    const unsubscribe = onRead(load);

    return () => {
      active = false;
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  return count;
};
