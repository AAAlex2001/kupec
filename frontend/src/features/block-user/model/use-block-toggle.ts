"use client";

import { blockCompanion, unblockCompanion } from "@/entities/conversation";

/** Заблокировать или разблокировать собеседника, потом обновить переписку. */
export const useBlockToggle = (conversationId: number, blocked: boolean, onDone: () => void) => {
  const toggle = async () => {
    await (blocked ? unblockCompanion(conversationId) : blockCompanion(conversationId));
    onDone();
  };

  return { label: blocked ? "Разблокировать" : "Заблокировать", toggle };
};
