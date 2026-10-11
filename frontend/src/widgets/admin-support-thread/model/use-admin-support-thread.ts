"use client";

import { useEffect, useState } from "react";
import { fetchAdminSupportThread, replySupport, type AdminSupportDetail } from "@/entities/support";
import { errorMessage } from "@/shared/lib/errors";

const REFRESH_MS = 5_000;

/** Обращение в админке: обновляется раз в 5 секунд, ответ сразу появляется в ленте. */
export const useAdminSupportThread = (id: number) => {
  const [detail, setDetail] = useState<AdminSupportDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = () =>
      fetchAdminSupportThread(id)
        .then((found) => active && setDetail(found))
        .catch((failure) => active && setError(errorMessage(failure, "Не удалось открыть обращение")));

    load();
    const interval = setInterval(load, REFRESH_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [id]);

  const reply = async (text: string, files: File[]) => {
    const message = await replySupport(id, text, files);
    setDetail((current) => current && { ...current, messages: [...current.messages, message] });
  };

  return { detail, error, reply };
};
