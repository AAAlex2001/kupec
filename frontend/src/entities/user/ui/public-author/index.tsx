"use client";

import Avatar from "@/shared/ui/avatar";
import { avatarLetter, displayName } from "../../lib/names";
import { useUser } from "../../model/user";
import styles from "./style.module.scss";

/** Кто публикует: аватар, имя и пометка «Публичная публикация». */
const PublicAuthor = () => {
  const { user } = useUser();
  if (!user) return null;

  return (
    <div className={styles.author}>
      <Avatar src={user.avatar_url} letter={avatarLetter(user)} />
      <div className={styles.info}>
        <p className={styles.name}>{displayName(user)}</p>
        <p className={styles.hint}>Публичная публикация</p>
      </div>
    </div>
  );
};

export default PublicAuthor;
