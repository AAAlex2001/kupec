"use client";

import { useEffect, useState } from "react";
import { fetchAdminSupportUnread } from "@/entities/support";
import { reportError } from "@/shared/lib/report-error";

const REFRESH_MS = 10_000;

/** Счётчик вкладки обновляется при переходах, возвращении в окно и чтении чата. */
export const useSupportCount = (pathname: string) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    let version = 0;

    const load = () => {
      if (document.hidden) return;
      const requestVersion = ++version;

      fetchAdminSupportUnread()
        .then((found) => {
          if (active && requestVersion === version) setCount(found.count);
        })
        .catch(reportError);
    };

    load();
    const interval = setInterval(load, REFRESH_MS);
    window.addEventListener("support:read", load);
    document.addEventListener("visibilitychange", load);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("support:read", load);
      document.removeEventListener("visibilitychange", load);
    };
  }, [pathname]);

  return count;
};
