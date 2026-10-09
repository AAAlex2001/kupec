"use client";

import { useEffect, useState } from "react";
import { fetchReviewable, type ReviewableListing } from "@/entities/review";
import { errorMessage } from "@/shared/lib/errors";

/** Объявления из переписок, по которым ещё можно оставить отзыв. */
export const useReviewable = () => {
  const [listings, setListings] = useState<ReviewableListing[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchReviewable()
      .then((found) => active && setListings(found))
      .catch((failure) => active && setError(errorMessage(failure, "Не удалось загрузить")));

    return () => {
      active = false;
    };
  }, []);

  return { listings, error };
};
