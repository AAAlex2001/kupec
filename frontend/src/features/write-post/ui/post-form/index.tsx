"use client";

import { deletePostMedia, uploadPostMedia, type Post } from "@/entities/post";
import { PublicAuthor } from "@/entities/user";
import { MY_POSTS_PATH } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import MediaPicker from "@/shared/ui/media-picker";
import Notice from "@/shared/ui/notice";
import TextEditor from "@/shared/ui/text-editor";
import { usePostForm } from "../../model/use-post-form";
import ListingPicker from "../listing-picker";
import styles from "./style.module.scss";

const MAX_LENGTH = 5000;
const MAX_MEDIA = 10;
const MAX_LISTINGS = 5;

type PostFormProps = {
  post?: Post;
};

/** Форма поста: автор, редактор, фото и видео, объявления. «Отмена», «В черновик» и «Опубликовать». */
const PostForm = ({ post }: PostFormProps) => {
  const form = usePostForm(post);

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        form.save(false);
      }}
    >
      <PublicAuthor />

      <TextEditor
        ariaLabel="Текст публикации"
        placeholder="Что у вас нового?"
        value={form.html}
        limit={MAX_LENGTH}
        onChange={form.setHtml}
      />

      <MediaPicker
        title="Фото и видео"
        files={form.media}
        max={MAX_MEDIA}
        upload={uploadPostMedia}
        remove={deletePostMedia}
        onChange={form.setMedia}
      />

      <ListingPicker listings={form.listings} max={MAX_LISTINGS} onChange={form.setListings} />

      {form.error && <Notice tone="error">{form.error}</Notice>}

      <div className={styles.actions}>
        <Button variant="secondary" href={MY_POSTS_PATH}>
          Отмена
        </Button>

        <div className={styles.save}>
          <Button
            variant="ghost"
            loading={form.pending === "draft"}
            disabled={form.empty || form.pending !== null}
            onClick={() => form.save(true)}
          >
            В черновик
          </Button>
          <Button
            type="submit"
            loading={form.pending === "publish"}
            disabled={form.empty || form.pending !== null}
          >
            Опубликовать
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PostForm;
