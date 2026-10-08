"use client";

import cn from "classnames";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { openedConversationId } from "./lib/opened";
import ConversationList from "./ui/conversation-list";
import styles from "./style.module.scss";

export { default as ChatPlaceholder } from "./ui/chat-placeholder";
export { default as ChatRoom } from "./ui/chat-room";

type MessengerProps = {
  children: ReactNode;
};

/** Раздел «Сообщения»: диалог слева, список справа. Список не перезагружается при смене диалога. */
const Messenger = ({ children }: MessengerProps) => {
  const openedId = openedConversationId(usePathname());

  return (
    <div className={cn(styles.messenger, openedId && styles.opened)}>
      <section className={styles.chat}>{children}</section>

      <aside className={styles.list}>
        <ConversationList activeId={openedId ?? undefined} />
      </aside>
    </div>
  );
};

export default Messenger;
