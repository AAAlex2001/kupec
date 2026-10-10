"use client";

import { useState } from "react";
import { toggleCommentLike, type Comment } from "@/entities/comment";
import { useUser } from "@/entities/user";
import { errorMessage } from "@/shared/lib/errors";

/** Лайк комментария со счётчиком. Гостю — окно входа. */
export const useCommentLike = (comment: Comment) => {
  const { user, openAuth } = useUser();
  const [liked, setLiked] = useState(comment.liked);
  const [likes, setLikes] = useState(comment.likes_count);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    if (!user) return openAuth();

    try {
      const result = await toggleCommentLike(comment.id, !liked);
      setLiked(result.liked);
      setLikes(result.likes_count);
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось поставить лайк"));
    }
  };

  return { liked, likes, error, toggle };
};
