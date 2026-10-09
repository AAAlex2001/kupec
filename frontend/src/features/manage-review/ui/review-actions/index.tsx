"use client";

import { useState } from "react";
import { deleteReview, type Review } from "@/entities/review";
import { errorMessage } from "@/shared/lib/errors";
import Button from "@/shared/ui/button";
import ConfirmModal from "@/shared/ui/confirm-modal";
import styles from "./style.module.scss";

type ReviewActionsProps = {
  review: Review;
  onEdit: () => void;
  onDeleted: () => void;
};

/** Кнопки своего отзыва: «Изменить» или «Исправить» у отклонённого и «Удалить». */
const ReviewActions = ({ review, onEdit, onDeleted }: ReviewActionsProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    setPending(true);

    try {
      await deleteReview(review.id);
      setConfirmOpen(false);
      onDeleted();
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось удалить отзыв"));
      setPending(false);
    }
  };

  return (
    <>
      {error && <p className={styles.error}>{error}</p>}

      <Button variant="ghost" onClick={onEdit}>
        {review.status === "rejected" ? "Исправить" : "Изменить"}
      </Button>
      <Button variant="danger" onClick={() => setConfirmOpen(true)}>
        Удалить
      </Button>

      <ConfirmModal
        open={confirmOpen}
        title="Удалить отзыв?"
        text="Отзыв удалится вместе с фото. Вернуть его будет нельзя."
        confirmLabel="Удалить"
        pending={pending}
        onConfirm={remove}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default ReviewActions;
