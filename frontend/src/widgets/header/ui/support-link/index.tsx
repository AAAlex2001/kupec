"use client";

import { useSupport } from "@/features/support-chat";
import Badge from "@/shared/ui/badge";
import { MessageCircleMoreIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

/** «Поддержка» в шапке рядом с темой: открывает чат, счётчик — новые ответы поддержки. */
const SupportLink = () => {
  const { unread, openChat } = useSupport();

  return (
    <button type="button" className={styles.link} onClick={openChat}>
      <MessageCircleMoreIcon />
      Поддержка
      {unread > 0 && <Badge count={unread} />}
    </button>
  );
};

export default SupportLink;
