"use client";

import { useState } from "react";
import { toggleFollow, useUser } from "@/entities/user";
import { errorMessage } from "@/shared/lib/errors";

/** Подписка на автора: включить или выключить. Гостю — окно входа. */
export const useFollow = (authorId: number, initial: boolean) => {
  const { user, openAuth } = useUser();
  const [following, setFollowing] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    if (!user) return openAuth();

    try {
      await toggleFollow(authorId, !following);
      setFollowing(!following);
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось изменить подписку"));
    }
  };

  return { following, error, toggle };
};
