"use client";

import type { FormEvent } from "react";
import type { Message } from "@/entities/conversation";
import Button from "@/shared/ui/button";
import { SendIcon } from "@/shared/ui/icons";
import Input from "@/shared/ui/input";
import { useSendMessage } from "../../model/use-send-message";
import styles from "./style.module.scss";

type MessageFormProps = {
  conversationId: number;
  onSent: (message: Message) => void;
};

/** Поле «Написать сообщение…» и кнопка отправки. Enter тоже отправляет. */
const MessageForm = ({ conversationId, onSent }: MessageFormProps) => {
  const { text, setText, pending, error, send } = useSendMessage(conversationId, onSent);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    send();
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.row}>
        <Input
          className={styles.input}
          value={text}
          onChange={setText}
          placeholder="Написать сообщение…"
          ariaLabel="Текст сообщения"
          maxLength={2000}
          autoComplete="off"
        />
        <Button type="submit" size="lg" loading={pending} ariaLabel="Отправить">
          {!pending && <SendIcon />}
        </Button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
};

export default MessageForm;
