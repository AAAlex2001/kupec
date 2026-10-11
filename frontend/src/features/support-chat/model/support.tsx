"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useSupportUnread } from "./use-support-unread";

type SupportValue = {
  chatOpen: boolean;
  unread: number;
  openChat: () => void;
  closeChat: () => void;
};

const SupportContext = createContext<SupportValue | null>(null);

/** Хранит, открыт ли чат поддержки и сколько непрочитанных ответов. Общий для шапки и нижнего бара. */
export const SupportProvider = ({ children }: { children: ReactNode }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const unread = useSupportUnread(chatOpen);

  const value = {
    chatOpen,
    unread,
    openChat: () => setChatOpen(true),
    closeChat: () => setChatOpen(false),
  };

  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>;
};

/** Открыт ли чат поддержки, счётчик непрочитанных ответов и управление чатом. */
export const useSupport = (): SupportValue => {
  const value = useContext(SupportContext);

  if (!value) {
    throw new Error("useSupport можно вызывать только внутри SupportProvider");
  }

  return value;
};
