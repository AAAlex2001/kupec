"use client";

import type { Comment, Thread } from "@/entities/comment";
import { ReplyForm } from "@/features/write-comment";
import CommentItem from "../comment-item";
import styles from "./style.module.scss";

type CommentThreadProps = {
  postId: number;
  thread: Thread;
  replyTo: Comment | null;
  onReply: (comment: Comment) => void;
  onSent: () => void;
  onCancel: () => void;
};

/** Корневой комментарий, а внутри него — ветка ответов с чертой слева и форма ответа, если отвечают в этой ветке. */
const CommentThread = ({ postId, thread, replyTo, onReply, onSent, onCancel }: CommentThreadProps) => {
  const root = thread.comment;
  const replying = replyTo !== null && (replyTo.id === root.id || replyTo.parent_id === root.id);
  const open = thread.replies.length > 0 || replying;

  return (
    <CommentItem comment={root} onReply={onReply} onChanged={onSent}>
      {open && (
        <div className={styles.thread}>
          {thread.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} onChanged={onSent} />
          ))}

          {replying && (
            <ReplyForm postId={postId} replyTo={replyTo} onSent={onSent} onCancel={onCancel} />
          )}
        </div>
      )}
    </CommentItem>
  );
};

export default CommentThread;
