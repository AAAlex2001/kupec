"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/shared/lib/errors";
import { fetchMyReviews } from "../api/reviews";
import type { ReviewList, ReviewStatus } from "./types";

/** Свои отзывы на вкладке: перезагружаются при смене вкладки и после действий. */
export const useMyReviews = (status: ReviewStatus) => {
  const [data, setData] = useState<ReviewList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;

    fetchMyReviews(status)
      .then((found) => active && setData(found))
      .catch((failure) => active && setError(errorMessage(failure, "Не удалось загрузить")));

    return () => {
      active = false;
    };
  }, [status, version]);

  const reload = () => setVersion((value) => value + 1);

  return { data, error, reload };
};
