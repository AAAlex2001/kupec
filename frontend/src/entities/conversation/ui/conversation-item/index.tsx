import cn from "classnames";
import Link from "next/link";
import { conversationPath } from "@/shared/config/routes";
import { formatMoment } from "@/shared/lib/format";
import Avatar from "@/shared/ui/avatar";
import Badge from "@/shared/ui/badge";
import { companionLetter, companionName } from "../../lib/names";
import type { Conversation } from "../../model/types";
import styles from "./style.module.scss";

type ConversationItemProps = {
  conversation: Conversation;
  active: boolean;
};

/** Диалог в списке: собеседник, время, объявление, последнее сообщение и непрочитанные (у открытого — нет). */
const ConversationItem = ({ conversation, active }: ConversationItemProps) => {
  const { companion, listing, unread_count } = conversation;

  return (
    <Link
      className={cn(styles.item, active && styles.active)}
      href={conversationPath(conversation.id)}
      aria-current={active ? "page" : undefined}
    >
      <div className={styles.head}>
        <span className={styles.author}>
          <Avatar size="sm" src={companion.avatar_url} letter={companionLetter(companion)} />
          <span className={styles.name}>{companionName(companion)}</span>
        </span>
        <span className={styles.time}>
          {formatMoment(conversation.last_message_at ?? conversation.created_at)}
        </span>
      </div>

      <p className={styles.listing}>{listing.title}</p>

      <div className={styles.last}>
        <p className={styles.text}>{conversation.last_message_text ?? "Сообщений пока нет"}</p>
        {!active && unread_count > 0 && <Badge count={unread_count} />}
      </div>
    </Link>
  );
};

export default ConversationItem;
