"use client";

import { usePost } from "@/entities/post";
import { RepostForm } from "@/features/repost-post";
import { FEED_PATH } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import { ArrowLeftIcon } from "@/shared/ui/icons";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

type RepostEditorProps = {
  id: number;
};

/** Страница «Репост с комментарием»: «Назад», заголовок, подсказка и форма репоста. */
const RepostEditor = ({ id }: RepostEditorProps) => {
  const { post, error } = usePost(id);

  return (
    <div className={styles.page}>
      <Button variant="secondary" href={FEED_PATH}>
        <ArrowLeftIcon />
        Назад
      </Button>

      <div className={styles.head}>
        <Title as="h1">Репост с комментарием</Title>
        <p className={styles.hint}>Комментарий появится над публикацией.</p>
      </div>

      {error && <Notice tone="error">{error}</Notice>}
      {!post && !error && <Loader />}
      {post && <RepostForm post={post} />}
    </div>
  );
};

export default RepostEditor;
