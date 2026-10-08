"use client";

import { useFavorites } from "@/entities/favorite";
import { useUser } from "@/entities/user";

/** В избранном ли объявление и переключатель. Гостю переключатель открывает окно входа. */
export const useFavoriteToggle = (listingId: number) => {
  const { user, openAuth } = useUser();
  const { isFavorite, toggle } = useFavorites();

  const onToggle = () => {
    if (!user) return openAuth();

    toggle(listingId);
  };

  return { active: isFavorite(listingId), onToggle };
};
