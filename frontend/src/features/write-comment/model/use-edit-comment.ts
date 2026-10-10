"use client";

import { useState } from "react";
import { updateComment, type Comment } from "@/entities/comment";
import { errorMessage } from "@/shared/lib/errors";

/** Правка текста своего комментария. */
export const useEditComment = (comment: Comment, onSaved: () => void) => {
  const [text, setText] = useState(comment.text);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setPending(true);
    setError(null);

    try {
      await updateComment(comment.id, text.trim());
      onSaved();
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось сохранить комментарий"));
      setPending(false);
    }
  };

  return { text, setText, pending, error, empty: text.trim() === "", save };
};
