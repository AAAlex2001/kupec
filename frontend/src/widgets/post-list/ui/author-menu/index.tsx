"use client";

import { reportPost, type Post } from "@/entities/post";
import { useFollow } from "@/features/follow-author";
import { ReportModal, useReport } from "@/features/report-content";
import ActionMenu from "@/shared/ui/action-menu";
import { authorActions } from "../../lib/author-actions";
import styles from "./style.module.scss";

type AuthorMenuProps = {
  post: Post;
};

/** Меню «⋯» чужого поста: открыть, подписка, объявление и «Пожаловаться». Гостю подписка и жалоба — после входа. */
const AuthorMenu = ({ post }: AuthorMenuProps) => {
  const follow = useFollow(post.author.id, post.following);
  const report = useReport((reason) => reportPost(post.id, reason));

  return (
    <>
      {follow.error && <p className={styles.error}>{follow.error}</p>}

      <ActionMenu
        ariaLabel="Действия с публикацией"
        actions={authorActions(post, {
          following: follow.following,
          toggleFollow: follow.toggle,
          report: report.start,
        })}
      />

      <ReportModal report={report} />
    </>
  );
};

export default AuthorMenu;
