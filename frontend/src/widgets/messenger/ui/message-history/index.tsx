"use client";

import { Fragment, useEffect, useRef } from "react";
import { MessageBubble, type Message } from "@/entities/conversation";
import { formatDay } from "@/shared/lib/format";
import { startsNewDay } from "../../lib/days";
import styles from "./style.module.scss";

type MessageHistoryProps = {
  messages: Message[];
  userId: number;
};

/** История сообщений с датами по дням. При новом сообщении прокручивается вниз. */
const MessageHistory = ({ messages, userId }: MessageHistoryProps) => {
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [messages.length]);

  if (messages.length === 0) {
    return <p className={styles.empty}>Напишите первое сообщение — автор ответит здесь.</p>;
  }

  return (
    <div ref={list} className={styles.history}>
      {messages.map((message, index) => (
        <Fragment key={message.id}>
          {startsNewDay(messages, index) && (
            <p className={styles.day}>{formatDay(message.created_at)}</p>
          )}
          <MessageBubble message={message} mine={message.sender_id === userId} />
        </Fragment>
      ))}
    </div>
  );
};

export default MessageHistory;
