"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { SupportMessage } from "../../model/types";
import SupportBubble from "../support-bubble";
import styles from "./style.module.scss";

type SupportMessagesProps = {
  messages: SupportMessage[];
  side: "visitor" | "admin";
  visitorName: string;
  intro?: ReactNode;
};

/** Лента переписки с поддержкой. Свои сообщения справа. При новом сообщении прокручивается вниз. */
const SupportMessages = ({ messages, side, visitorName, intro }: SupportMessagesProps) => {
  const end = useRef<HTMLDivElement>(null);
  const otherName = side === "visitor" ? "Поддержка «Купца»" : visitorName;

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  return (
    <div className={styles.messages}>
      {intro}

      {messages.map((message) => (
        <SupportBubble
          key={message.id}
          message={message}
          mine={message.from_admin === (side === "admin")}
          author={otherName}
        />
      ))}

      <div ref={end} />
    </div>
  );
};

export default SupportMessages;
