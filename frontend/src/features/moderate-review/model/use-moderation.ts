"use client";

import { useState } from "react";
import { approveReview, editReviewText, rejectReview, removeReview, type Review } from "@/entities/review";
import { errorMessage } from "@/shared/lib/errors";

export type ModerationDialog = "reject" | "edit" | "delete" | null;

/** Действия модератора над отзывом. После успеха окно закрывается и список обновляется. */
export const useModeration = (review: Review, onDone: () => void) => {
  const [dialog, setDialog] = useState<ModerationDialog>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<unknown>) => {
    setPending(true);
    setError(null);

    try {
      await action();
      setDialog(null);
      onDone();
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось выполнить действие"));
    }

    setPending(false);
  };

  return {
    dialog,
    setDialog,
    pending,
    error,
    approve: () => run(() => approveReview(review.id)),
    reject: (reason: string) => run(() => rejectReview(review.id, reason)),
    editText: (text: string) => run(() => editReviewText(review.id, text)),
    remove: () => run(() => removeReview(review.id)),
  };
};
