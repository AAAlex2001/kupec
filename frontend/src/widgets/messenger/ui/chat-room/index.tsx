"use client";

import { useConversation } from "@/entities/conversation";
import { useUser } from "@/entities/user";
import { MessageForm } from "@/features/send-message";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import ChatBlocked from "../chat-blocked";
import ChatHeader from "../chat-header";
import ChatMenu from "../chat-menu";
import MessageHistory from "../message-history";
import styles from "./style.module.scss";

type ChatRoomProps = {
  conversationId: number;
};

/** Открытый диалог: шапка с меню, предупреждение, сообщения и поле отправки. */
const ChatRoom = ({ conversationId }: ChatRoomProps) => {
  const { user } = useUser();
  const { detail, error, addMessage, reload } = useConversation(conversationId);

  if (error) return <Notice tone="error">{error}</Notice>;
  if (!detail || !user) return <Loader />;

  const blocked = detail.blocked_by_me || detail.blocked_me;

  return (
    <div className={styles.room}>
      <ChatHeader
        conversation={detail.conversation}
        actions={<ChatMenu detail={detail} onSent={addMessage} onChanged={reload} />}
      />

      <div className={styles.notice}>
        <Notice tone="info">
          Не переходите в другие мессенджеры и не отправляйте предоплату — так безопаснее.
        </Notice>
      </div>

      <MessageHistory messages={detail.messages} userId={user.id} />

      {blocked ? (
        <ChatBlocked
          conversationId={conversationId}
          byMe={detail.blocked_by_me}
          onChanged={reload}
        />
      ) : (
        <MessageForm conversationId={conversationId} onSent={addMessage} />
      )}
    </div>
  );
};

export default ChatRoom;
