import { PostForm } from "@/features/write-post";
import PostPageHead from "./ui/post-page-head";
import styles from "./style.module.scss";

export { default as EditPost } from "./ui/edit-post";

/** Страница «Новая публикация»: ссылка назад, заголовок и форма поста. */
const NewPost = () => (
  <div className={styles.page}>
    <PostPageHead title="Новая публикация" hint="Черновик · ещё не опубликовано" />
    <PostForm />
  </div>
);

export default NewPost;
