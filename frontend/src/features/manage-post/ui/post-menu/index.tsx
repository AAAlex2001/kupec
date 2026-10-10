"use client";

import { useState } from "react";
import { deletePost, type Post } from "@/entities/post";
import { editPostPath, postPath } from "@/shared/config/routes";
import { errorMessage } from "@/shared/lib/errors";
import ActionMenu from "@/shared/ui/action-menu";
import ConfirmModal from "@/shared/ui/confirm-modal";
import { ExternalLinkIcon, PencilIcon, TrashIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

type PostMenuProps = {
  post: Post;
  onDeleted: () => void;
};

/** Меню «⋯» своего поста: «Открыть публикацию», «Изменить» (кроме репоста) и «Удалить» с подтверждением. */
const PostMenu = ({ post, onDeleted }: PostMenuProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    setPending(true);

    try {
      await deletePost(post.id);
      setConfirmOpen(false);
      onDeleted();
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось удалить публикацию"));
      setPending(false);
    }
  };

  return (
    <>
      {error && <p className={styles.error}>{error}</p>}

      <ActionMenu
        ariaLabel="Действия с публикацией"
        actions={[
          { label: "Открыть публикацию", Icon: ExternalLinkIcon, href: postPath(post.id) },
          ...(post.repost_of
            ? []
            : [{ label: "Изменить", Icon: PencilIcon, href: editPostPath(post.id) }]),
          { label: "Удалить", Icon: TrashIcon, danger: true, onClick: () => setConfirmOpen(true) },
        ]}
      />

      <ConfirmModal
        open={confirmOpen}
        title="Удалить публикацию?"
        text="Публикация удалится вместе с фото и видео. Вернуть её будет нельзя."
        confirmLabel="Удалить"
        pending={pending}
        onConfirm={remove}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default PostMenu;
