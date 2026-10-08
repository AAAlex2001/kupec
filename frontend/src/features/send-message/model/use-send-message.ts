"use client";

import { useState } from "react";
import { sendMessage, type Message } from "@/entities/conversation";
import { errorMessage } from "@/shared/lib/errors";

/** Текст нового сообщения и его отправка. После отправки поле очищается. */
export const useSendMessage = (conversationId: number, onSent: (message: Message) => void) => {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (!text.trim() || pending) return;

    setPending(true);
    setError(null);

    try {
      onSent(await sendMessage(conversationId, text));
      setText("");
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось отправить"));
    }

    setPending(false);
  };

  return { text, setText, pending, error, send };
};
