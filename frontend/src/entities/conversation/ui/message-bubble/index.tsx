import cn from "classnames";
import { formatTime } from "@/shared/lib/format";
import type { Message } from "../../model/types";
import styles from "./style.module.scss";

type MessageBubbleProps = {
  message: Message;
  mine: boolean;
};

/** Сообщение в переписке: свои справа голубые, чужие слева серые. */
const MessageBubble = ({ message, mine }: MessageBubbleProps) => (
  <div className={cn(styles.row, mine && styles.mine)}>
    <div className={styles.bubble}>
      <p className={styles.text}>{message.text}</p>
      <p className={styles.time}>{formatTime(message.created_at)}</p>
    </div>
  </div>
);

export default MessageBubble;
