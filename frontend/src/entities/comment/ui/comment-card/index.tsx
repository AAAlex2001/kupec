import Link from "next/link";
import type { ReactNode } from "react";
import { userPath } from "@/shared/config/routes";
import { formatDate, formatTime } from "@/shared/lib/format";
import Avatar from "@/shared/ui/avatar";
import type { Comment } from "../../model/types";
import styles from "./style.module.scss";

type CommentCardProps = {
  comment: Comment;
  menu?: ReactNode;
  editor?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

/** Комментарий: автор — ссылка на его страницу, дата и время, «В ответ …», текст. Меню «⋯», форма правки вместо текста, кнопки и ветка ответов — слоты. */
const CommentCard = ({ comment, menu, editor, actions, children }: CommentCardProps) => {
  const name = comment.author.name ?? "Пользователь";

  return (
    <div className={styles.comment}>
      <div className={styles.head}>
        <Link className={styles.author} href={userPath(comment.author.id)}>
          <Avatar src={comment.author.avatar_url} letter={name[0]} />
          <span className={styles.info}>
            <span className={styles.name}>{name}</span>
            <span className={styles.date}>
              {formatDate(comment.created_at)} · {formatTime(comment.created_at)}
            </span>
          </span>
        </Link>
        {menu}
      </div>

      {comment.reply_to_name && <p className={styles.reply}>В ответ {comment.reply_to_name}</p>}

      {editor || <p className={styles.text}>{comment.text}</p>}

      {actions}
      {children}
    </div>
  );
};

export default CommentCard;
