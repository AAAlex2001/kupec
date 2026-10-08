"use client";

import { useEffect, useState } from "react";
import type { Listing } from "@/entities/listing";
import { errorMessage } from "@/shared/lib/errors";
import { fetchFavorites } from "../api/favorites";

/** Объявления из избранного. Грузятся один раз при открытии раздела. */
export const useFavoriteListings = () => {
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchFavorites()
      .then((found) => active && setListings(found))
      .catch((failure) => active && setError(errorMessage(failure, "Не удалось загрузить")));

    return () => {
      active = false;
    };
  }, []);

  return { listings, error };
};
