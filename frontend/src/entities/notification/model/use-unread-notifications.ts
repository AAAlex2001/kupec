"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { reportError } from "@/shared/lib/report-error";
import { fetchUnreadNotifications } from "../api/notifications";

/** Сколько непрочитанных уведомлений. Перечитывается при переходе между страницами. */
export const useUnreadNotifications = () => {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;

    fetchUnreadNotifications()
      .then((found) => active && setCount(found.count))
      .catch(reportError);

    return () => {
      active = false;
    };
  }, [pathname]);

  return count;
};
