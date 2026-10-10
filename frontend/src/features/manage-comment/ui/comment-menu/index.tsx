"use client";

import { useState } from "react";
import { deleteComment, type Comment } from "@/entities/comment";
import { errorMessage } from "@/shared/lib/errors";
import ActionMenu from "@/shared/ui/action-menu";
import ConfirmModal from "@/shared/ui/confirm-modal";
import { PencilIcon, TrashIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

type CommentMenuProps = {
  comment: Comment;
  onEdit: () => void;
  onDeleted: () => void;
};

/** Меню «⋯» своего комментария: «Изменить» и «Удалить» с подтверждением. */
const CommentMenu = ({ comment, onEdit, onDeleted }: CommentMenuProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    setPending(true);

    try {
      await deleteComment(comment.id);
      setConfirmOpen(false);
      onDeleted();
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось удалить комментарий"));
      setPending(false);
    }
  };

  return (
    <>
      {error && <p className={styles.error}>{error}</p>}

      <ActionMenu
        ariaLabel="Действия с комментарием"
        actions={[
          { label: "Изменить", Icon: PencilIcon, onClick: onEdit },
          { label: "Удалить", Icon: TrashIcon, danger: true, onClick: () => setConfirmOpen(true) },
        ]}
      />

      <ConfirmModal
        open={confirmOpen}
        title="Удалить комментарий?"
        text="Ответы на него тоже удалятся."
        confirmLabel="Удалить"
        pending={pending}
        onConfirm={remove}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default CommentMenu;
