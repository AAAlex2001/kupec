"use client";

import { useBlockToggle } from "@/features/block-user";
import Button from "@/shared/ui/button";
import Notice from "@/shared/ui/notice";
import styles from "./style.module.scss";

type ChatBlockedProps = {
  conversationId: number;
  byMe: boolean;
  onChanged: () => void;
};

/** Вместо поля ввода, когда переписка закрыта блокировкой. Свою блокировку можно снять. */
const ChatBlocked = ({ conversationId, byMe, onChanged }: ChatBlockedProps) => {
  const block = useBlockToggle(conversationId, true, onChanged);

  if (!byMe) {
    return <Notice tone="info">Пользователь ограничил переписку с вами.</Notice>;
  }

  return (
    <div className={styles.blocked}>
      <Notice tone="info">Вы заблокировали пользователя — он не может вам писать.</Notice>
      <Button variant="ghost" onClick={block.toggle}>
        Разблокировать
      </Button>
    </div>
  );
};

export default ChatBlocked;
