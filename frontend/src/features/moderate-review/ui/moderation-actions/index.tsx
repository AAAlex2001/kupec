"use client";

import type { Review } from "@/entities/review";
import Button from "@/shared/ui/button";
import ConfirmModal from "@/shared/ui/confirm-modal";
import TextModal from "@/shared/ui/text-modal";
import { useModeration } from "../../model/use-moderation";
import styles from "./style.module.scss";

type ModerationActionsProps = {
  review: Review;
  onDone: () => void;
};

/** Кнопки модератора под отзывом: одобрить, отклонить с причиной, поправить текст, удалить. */
const ModerationActions = ({ review, onDone }: ModerationActionsProps) => {
  const moderation = useModeration(review, onDone);
  const close = () => moderation.setDialog(null);

  return (
    <>
      {moderation.error && <p className={styles.error}>{moderation.error}</p>}

      {review.status !== "published" && (
        <Button loading={moderation.pending && !moderation.dialog} onClick={moderation.approve}>
          Одобрить
        </Button>
      )}
      {review.status !== "rejected" && (
        <Button variant="ghost" onClick={() => moderation.setDialog("reject")}>
          Отклонить
        </Button>
      )}
      <Button variant="ghost" onClick={() => moderation.setDialog("edit")}>
        Изменить текст
      </Button>
      <Button variant="danger" onClick={() => moderation.setDialog("delete")}>
        Удалить
      </Button>

      {moderation.dialog === "reject" && (
        <TextModal
          open
          title="Отклонить отзыв"
          label="Причина — её увидит автор"
          submitLabel="Отклонить"
          danger
          pending={moderation.pending}
          onSubmit={moderation.reject}
          onClose={close}
        />
      )}

      {moderation.dialog === "edit" && (
        <TextModal
          open
          title="Изменить текст отзыва"
          label="Текст отзыва"
          initial={review.text ?? ""}
          submitLabel="Сохранить"
          pending={moderation.pending}
          onSubmit={moderation.editText}
          onClose={close}
        />
      )}

      <ConfirmModal
        open={moderation.dialog === "delete"}
        title="Удалить отзыв?"
        text="Отзыв удалится вместе с фото, рейтинг продавца пересчитается."
        confirmLabel="Удалить"
        pending={moderation.pending}
        onConfirm={moderation.remove}
        onClose={close}
      />
    </>
  );
};

export default ModerationActions;
