"use client";

import { useEffect, useState } from "react";
import { reportError } from "@/shared/lib/report-error";
import { fetchTelegramLink } from "../api/telegram";
import type { TelegramLink } from "./types";

/** Подключение Telegram. Перечитывается, когда пользователь возвращается на вкладку из бота. */
export const useTelegramLink = () => {
  const [link, setLink] = useState<TelegramLink | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    const load = () => {
      fetchTelegramLink()
        .then((found) => active && setLink(found))
        .catch(reportError);
    };

    load();
    window.addEventListener("focus", load);

    return () => {
      active = false;
      window.removeEventListener("focus", load);
    };
  }, [version]);

  return { link, reload: () => setVersion(version + 1) };
};
