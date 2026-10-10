"use client";

import { hidePost, removePost, showPost, type Post } from "@/entities/post";
import Button from "@/shared/ui/button";
import ConfirmModal from "@/shared/ui/confirm-modal";
import { usePostModeration } from "../../model/use-post-moderation";
import styles from "./style.module.scss";

type PostModerationProps = {
  post: Post;
  onDone: () => void;
};

/** Кнопки модератора под постом: скрыть из ленты или вернуть, удалить с подтверждением. */
const PostModeration = ({ post, onDone }: PostModerationProps) => {
  const moderation = usePostModeration(onDone);
  const hidden = post.status === "hidden";

  return (
    <div className={styles.actions}>
      {moderation.error && <p className={styles.error}>{moderation.error}</p>}

      {hidden && (
        <Button loading={moderation.pending} onClick={() => moderation.run(() => showPost(post.id))}>
          Вернуть в ленту
        </Button>
      )}
      {!hidden && (
        <Button
          variant="secondary"
          loading={moderation.pending}
          onClick={() => moderation.run(() => hidePost(post.id))}
        >
          Скрыть
        </Button>
      )}
      <Button variant="danger" onClick={() => moderation.setConfirming(true)}>
        Удалить
      </Button>

      <ConfirmModal
        open={moderation.confirming}
        title="Удалить публикацию?"
        text="Пост удалится вместе с фото, комментариями и жалобами. Вернуть его будет нельзя."
        confirmLabel="Удалить"
        pending={moderation.pending}
        onConfirm={() => moderation.run(() => removePost(post.id))}
        onClose={() => moderation.setConfirming(false)}
      />
    </div>
  );
};

export default PostModeration;
