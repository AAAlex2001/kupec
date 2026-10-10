"use client";

import { useState } from "react";
import { repostPost, togglePostLike, togglePostSave, type Post } from "@/entities/post";
import { useUser } from "@/entities/user";
import { postPath } from "@/shared/config/routes";
import { errorMessage } from "@/shared/lib/errors";

/** Лайк, репост, «Сохранить» и «Поделиться» у поста. Гостю вместо действия — окно входа.
 *
 * onUnsaved — когда пост убрали из сохранённого.
 */
export const usePostReactions = (post: Post, onUnsaved?: () => void) => {
  const { user, openAuth } = useUser();
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes_count);
  const [reposts, setReposts] = useState(post.reposts_count);
  const [saved, setSaved] = useState(post.saved);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleLike = async () => {
    if (!user) return openAuth();

    try {
      const result = await togglePostLike(post.id, !liked);
      setLiked(result.liked);
      setLikes(result.likes_count);
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось поставить лайк"));
    }
  };

  const repost = async () => {
    if (!user) return openAuth();

    try {
      await repostPost(post.id, "");
      setReposts(reposts + 1);
      setNotice("Репост опубликован — он во вкладке «Репосты»");
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось репостнуть"));
    }
  };

  const toggleSave = async () => {
    if (!user) return openAuth();

    try {
      await togglePostSave(post.id, !saved);
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось сохранить пост"));
      return;
    }

    setSaved(!saved);
    if (saved) onUnsaved?.();
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${postPath(post.id)}`);
      setNotice("Ссылка скопирована");
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось скопировать ссылку"));
    }
  };

  return {
    signedIn: Boolean(user),
    openAuth,
    liked,
    likes,
    reposts,
    saved,
    notice,
    error,
    toggleLike,
    repost,
    toggleSave,
    share,
  };
};
