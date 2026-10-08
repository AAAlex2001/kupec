"use client";

import { useEffect, useState } from "react";
import { fetchUnreadCount } from "../api/conversations";

const REFRESH_MS = 15_000;

/** Сколько всего непрочитанных сообщений. Обновляется раз в 15 секунд. */
export const useUnreadCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;

    const load = () =>
      fetchUnreadCount()
        .then((unread) => active && setCount(unread.count))
        .catch(() => undefined);

    load();
    const interval = setInterval(load, REFRESH_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return count;
};
