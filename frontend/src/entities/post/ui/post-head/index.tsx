import Link from "next/link";
import type { ReactNode } from "react";
import { userPath } from "@/shared/config/routes";
import { formatDate } from "@/shared/lib/format";
import Avatar from "@/shared/ui/avatar";
import type { PostAuthor } from "../../model/types";
import TelegramBadge from "../telegram-badge";
import styles from "./style.module.scss";

type PostHeadProps = {
  author: PostAuthor;
  date: string;
  note?: string;
  views?: number;
  telegramUrl?: string | null;
  menu?: ReactNode;
};

/** Шапка поста: аватар и имя — ссылка на страницу автора, дата с пометкой, просмотры, плашка Telegram и меню «⋯». */
const PostHead = ({ author, date, note, views, telegramUrl, menu }: PostHeadProps) => {
  const name = author.name ?? "Пользователь";

  return (
    <div className={styles.head}>
      <Link className={styles.author} href={userPath(author.id)}>
        <Avatar src={author.avatar_url} letter={name[0]} />
        <span className={styles.info}>
          <span className={styles.name}>{name}</span>
          <span className={styles.date}>
            {formatDate(date)}
            {note && ` · ${note}`}
            {views !== undefined && ` · Просмотров: ${views}`}
          </span>
        </span>
      </Link>
      {telegramUrl && <TelegramBadge url={telegramUrl} />}
      {menu}
    </div>
  );
};

export default PostHead;
