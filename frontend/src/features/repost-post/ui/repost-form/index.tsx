"use client";

import { OriginalPost, type Post } from "@/entities/post";
import { PublicAuthor } from "@/entities/user";
import { FEED_PATH } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import Notice from "@/shared/ui/notice";
import TextEditor from "@/shared/ui/text-editor";
import { useRepostForm } from "../../model/use-repost-form";
import styles from "./style.module.scss";

const MAX_LENGTH = 5000;

type RepostFormProps = {
  post: Post;
};

/** Репост с комментарием по макету: автор, редактор, оригинал в рамке, «Отмена» и «Опубликовать». */
const RepostForm = ({ post }: RepostFormProps) => {
  const form = useRepostForm(post.id);

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        form.publish();
      }}
    >
      <PublicAuthor />

      <TextEditor
        ariaLabel="Комментарий к репосту"
        placeholder="Добавьте комментарий к репосту"
        value={form.html}
        limit={MAX_LENGTH}
        onChange={form.setHtml}
      />

      <OriginalPost post={post.repost_of ?? post} />

      <p className={styles.hint}>Репост появится в ленте и во вкладке «Репосты».</p>

      {form.error && <Notice tone="error">{form.error}</Notice>}

      <div className={styles.actions}>
        <Button variant="ghost" href={FEED_PATH}>
          Отмена
        </Button>
        <Button type="submit" loading={form.pending}>
          Опубликовать
        </Button>
      </div>
    </form>
  );
};

export default RepostForm;
