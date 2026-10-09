"use client";

import { sendMessage, type Message } from "@/entities/conversation";
import { useUser } from "@/entities/user";
import { reportError } from "@/shared/lib/report-error";

/** Отправить собеседнику свой телефон из профиля. Без телефона делиться нечем. */
export const useShareContacts = (conversationId: number, onSent: (message: Message) => void) => {
  const { user } = useUser();
  const phone = user?.phone ?? null;

  const share = async () => {
    if (!phone) return;

    try {
      onSent(await sendMessage(conversationId, `Мой телефон: ${phone}`));
    } catch (failure) {
      reportError(failure);
    }
  };

  return { canShare: phone !== null, share };
};
