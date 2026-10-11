"use client";

import { useState } from "react";
import { toggleArticleLike, type Article } from "@/entities/article";
import { useUser } from "@/entities/user";
import { articlePath } from "@/shared/config/routes";
import { errorMessage } from "@/shared/lib/errors";

/** Лайк и «Поделиться» у статьи. Гостю вместо лайка — окно входа, повторный клик во время запроса не уходит. */
export const useArticleReactions = (article: Article) => {
  const { user, openAuth } = useUser();
  const [liked, setLiked] = useState(article.liked);
  const [likes, setLikes] = useState(article.likes_count);
  const [liking, setLiking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleLike = async () => {
    if (!user) return openAuth();

    setLiking(true);
    setNotice(null);
    setError(null);
    try {
      const result = await toggleArticleLike(article.id, !liked);
      setLiked(result.liked);
      setLikes(result.likes_count);
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось поставить лайк"));
    } finally {
      setLiking(false);
    }
  };

  const share = async () => {
    setNotice(null);
    setError(null);
    try {
      const path = articlePath(article.section, article.slug);
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setNotice("Ссылка скопирована");
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось скопировать ссылку"));
    }
  };

  return { liked, likes, liking, notice, error, toggleLike, share };
};
