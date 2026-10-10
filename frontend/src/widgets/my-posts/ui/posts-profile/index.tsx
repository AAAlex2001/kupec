"use client";

import type { PostCounts } from "@/entities/post";
import { avatarLetter, displayName, useUser } from "@/entities/user";
import { plural } from "@/shared/lib/format";
import Avatar from "@/shared/ui/avatar";
import styles from "./style.module.scss";

type PostsProfileProps = {
  counts: PostCounts | null;
};

/** Автор над своими постами: аватар, имя и «3 публикации · 1 черновик». */
const PostsProfile = ({ counts }: PostsProfileProps) => {
  const { user } = useUser();
  if (!user) return null;

  const published = counts?.published ?? 0;
  const drafts = counts?.draft ?? 0;

  return (
    <div className={styles.profile}>
      <Avatar src={user.avatar_url} letter={avatarLetter(user)} size="lg" />
      <div className={styles.info}>
        <p className={styles.name}>{displayName(user)}</p>
        <p className={styles.stats}>
          {published} {plural(published, ["публикация", "публикации", "публикаций"])} · {drafts}{" "}
          {plural(drafts, ["черновик", "черновика", "черновиков"])}
        </p>
      </div>
    </div>
  );
};

export default PostsProfile;
