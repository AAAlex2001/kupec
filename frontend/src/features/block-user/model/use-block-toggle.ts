"use client";

import { blockCompanion, unblockCompanion } from "@/entities/conversation";
import { reportError } from "@/shared/lib/report-error";

/** Заблокировать или разблокировать собеседника, потом обновить переписку. */
export const useBlockToggle = (conversationId: number, blocked: boolean, onDone: () => void) => {
  const toggle = async () => {
    try {
      await (blocked ? unblockCompanion(conversationId) : blockCompanion(conversationId));
      onDone();
    } catch (failure) {
      reportError(failure);
    }
  };

  return { label: blocked ? "Разблокировать" : "Заблокировать", toggle };
};
