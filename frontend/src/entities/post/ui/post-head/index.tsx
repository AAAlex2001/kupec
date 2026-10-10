import Link from "next/link";
import type { ReactNode } from "react";
import { userPath } from "@/shared/config/routes";
import { formatDate } from "@/shared/lib/format";
import Avatar from "@/shared/ui/avatar";
import type { PostAuthor } from "../../model/types";
import styles from "./style.module.scss";

type PostHeadProps = {
  author: PostAuthor;
  date: string;
  note?: string;
  menu?: ReactNode;
};

/** Шапка поста: аватар и имя — ссылка на страницу автора, дата с пометкой и меню «⋯». */
const PostHead = ({ author, date, note, menu }: PostHeadProps) => {
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
          </span>
        </span>
      </Link>
      {menu}
    </div>
  );
};

export default PostHead;
