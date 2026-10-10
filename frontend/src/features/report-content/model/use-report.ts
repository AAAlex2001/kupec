"use client";

import { useState } from "react";
import { useUser } from "@/entities/user";
import { errorMessage } from "@/shared/lib/errors";

export type ReportState = {
  open: boolean;
  sent: boolean;
  pending: boolean;
  error: string | null;
  start: () => void;
  submit: (reason: string) => void;
  close: () => void;
};

/** Жалоба: открыть окно (гостю — вход), отправить причину и показать «Спасибо». */
export const useReport = (send: (reason: string) => Promise<void>): ReportState => {
  const { user, openAuth } = useUser();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = () => {
    if (!user) return openAuth();

    setSent(false);
    setError(null);
    setOpen(true);
  };

  const submit = async (reason: string) => {
    setPending(true);
    setError(null);

    try {
      await send(reason);
      setSent(true);
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось отправить жалобу"));
    }

    setPending(false);
  };

  return { open, sent, pending, error, start, submit, close: () => setOpen(false) };
};
