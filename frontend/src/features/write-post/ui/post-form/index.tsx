"use client";

import { deletePostMedia, uploadPostMedia, type Post } from "@/entities/post";
import { PublicAuthor } from "@/entities/user";
import { MY_POSTS_PATH } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import MediaPicker from "@/shared/ui/media-picker";
import Notice from "@/shared/ui/notice";
import TextEditor from "@/shared/ui/text-editor";
import { usePostForm } from "../../model/use-post-form";
import { AI_PANEL } from "../ai-panel";
import ListingPicker from "../listing-picker";
import TelegramToggle from "../telegram-toggle";
import styles from "./style.module.scss";

const MAX_LENGTH = 5000;
const MAX_MEDIA = 10;
const MAX_LISTINGS = 5;

type PostFormProps = {
  post?: Post;
};

/** Форма поста: автор, редактор, фото и видео, объявления, у нового — флажок Telegram. «Отмена», «В черновик» и «Опубликовать». */
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
        panel={AI_PANEL}
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

      {!post && <TelegramToggle checked={form.telegram} onChange={form.setTelegram} />}

      {form.error && <Notice tone="error">{form.error}</Notice>}

      <div className={styles.actions}>
        <Button variant="ghost" href={MY_POSTS_PATH}>
          Отмена
        </Button>

        <div className={styles.save}>
          <Button
            variant="secondary"
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
