"use client";

import { usePost } from "@/entities/post";
import { PostForm } from "@/features/write-post";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import PostPageHead from "../post-page-head";
import styles from "../../style.module.scss";

type EditPostProps = {
  id: number;
};

/** Страница «Изменить публикацию»: загружает свой пост и открывает его в форме. */
const EditPost = ({ id }: EditPostProps) => {
  const { post, error } = usePost(id);

  return (
    <div className={styles.page}>
      <PostPageHead title="Изменить публикацию" hint="Изменения увидят все читатели" />

      {error && <Notice tone="error">{error}</Notice>}
      {!post && !error && <Loader />}
      {post && <PostForm post={post} />}
    </div>
  );
};

export default EditPost;
