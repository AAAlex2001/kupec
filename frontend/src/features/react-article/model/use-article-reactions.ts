"use client";

import { useState } from "react";
import { toggleArticleLike, type Article } from "@/entities/article";
import { useUser } from "@/entities/user";
import { articlePath } from "@/shared/config/routes";
import { errorMessage } from "@/shared/lib/errors";

/** Лайк и «Поделиться» у статьи. Гостю вместо лайка — окно входа. */
export const useArticleReactions = (article: Article) => {
  const { user, openAuth } = useUser();
  const [liked, setLiked] = useState(article.liked);
  const [likes, setLikes] = useState(article.likes_count);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleLike = async () => {
    if (!user) return openAuth();

    try {
      const result = await toggleArticleLike(article.id, !liked);
      setLiked(result.liked);
      setLikes(result.likes_count);
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось поставить лайк"));
    }
  };

  const share = async () => {
    try {
      const path = articlePath(article.section, article.slug);
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setNotice("Ссылка скопирована");
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось скопировать ссылку"));
    }
  };

  return { liked, likes, notice, error, toggleLike, share };
};
