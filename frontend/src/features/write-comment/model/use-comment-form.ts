"use client";

import { useState } from "react";
import { createComment, type CommentTarget } from "@/entities/comment";
import { errorMessage } from "@/shared/lib/errors";

/** Текст комментария или ответа к посту или статье и отправка. После отправки поле очищается. */
export const useCommentForm = (
  target: CommentTarget,
  replyToId: number | null,
  onSent: () => void,
) => {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setPending(true);
    setError(null);

    try {
      await createComment(target, { text: text.trim(), reply_to_id: replyToId });
      setText("");
      onSent();
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось отправить комментарий"));
    }

    setPending(false);
  };

  return { text, setText, pending, error, empty: text.trim() === "", send };
};
