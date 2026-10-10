"use client";

import { useState, type ReactNode } from "react";
import { CommentCard, type Comment } from "@/entities/comment";
import { useUser } from "@/entities/user";
import { CommentMenu } from "@/features/manage-comment";
import { CommentLike } from "@/features/react-comment";
import { EditForm } from "@/features/write-comment";
import Button from "@/shared/ui/button";
import { ReplyIcon } from "@/shared/ui/icons";
import CommentReportMenu from "../comment-report-menu";
import styles from "./style.module.scss";

type CommentItemProps = {
  comment: Comment;
  onReply: (comment: Comment) => void;
  onChanged: () => void;
  children?: ReactNode;
};

/** Комментарий с «Ответить» и «Нравится». У своего — меню «Изменить» и «Удалить», у чужого — «Пожаловаться».
 *
 * Гостю ответ и лайк — после входа. children — ветка ответов.
 */
const CommentItem = ({ comment, onReply, onChanged, children }: CommentItemProps) => {
  const { user, openAuth } = useUser();
  const [editing, setEditing] = useState(false);
  const own = comment.author.id === user?.id;

  const menu = own ? (
    <CommentMenu comment={comment} onEdit={() => setEditing(true)} onDeleted={onChanged} />
  ) : (
    <CommentReportMenu comment={comment} />
  );

  const reply = () => {
    if (!user) return openAuth();
    onReply(comment);
  };

  const saved = () => {
    setEditing(false);
    onChanged();
  };

  return (
    <CommentCard
      comment={comment}
      menu={menu}
      editor={editing && <EditForm comment={comment} onSaved={saved} onCancel={() => setEditing(false)} />}
      actions={
        <div className={styles.actions}>
          <Button variant="secondary" onClick={reply}>
            <ReplyIcon />
            Ответить
          </Button>
          <CommentLike comment={comment} />
        </div>
      }
    >
      {children}
    </CommentCard>
  );
};

export default CommentItem;
