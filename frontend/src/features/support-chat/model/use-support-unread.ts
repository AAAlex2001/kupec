"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchSupportUnread } from "@/entities/support";
import { reportError } from "@/shared/lib/report-error";

const REFRESH_MS = 60_000;

/** Сколько непрочитанных ответов поддержки. Пока чат закрыт: раз в минуту и при переходе между страницами. */
export const useSupportUnread = (open: boolean) => {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (open) return;
    let active = true;

    const load = () =>
      fetchSupportUnread()
        .then((found) => active && setCount(found.count))
        .catch(reportError);

    load();
    const interval = setInterval(load, REFRESH_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [pathname, open]);

  return open ? 0 : count;
};
