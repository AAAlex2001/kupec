"use client";

import { useState } from "react";
import { createReview, updateReview, type Review, type ReviewPhoto } from "@/entities/review";
import { errorMessage } from "@/shared/lib/errors";
import type { ReviewTarget } from "./types";

const RATING_ERROR = "Выберите общую оценку";

/** Форма отзыва: новый по объявлению или правка своего. После сохранения отдаёт отзыв наружу. */
export const useReviewForm = (
  target: ReviewTarget,
  review: Review | undefined,
  onSaved: (review: Review) => void,
) => {
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [text, setText] = useState(review?.text ?? "");
  const [anonymous, setAnonymous] = useState(review?.anonymous ?? false);
  const [photos, setPhotos] = useState<ReviewPhoto[]>(review?.photos ?? []);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const changeRating = (value: number) => {
    setRating(value);
    setRatingError(null);
  };

  const submit = async () => {
    if (rating === 0) {
      setRatingError(RATING_ERROR);
      setError("Не удалось отправить отзыв. Выберите оценку и попробуйте снова.");
      return;
    }

    const payload = {
      rating,
      text: text.trim() || null,
      anonymous,
      photo_ids: photos.map((photo) => photo.id),
    };

    setPending(true);
    setError(null);

    try {
      onSaved(await (review ? updateReview(review.id, payload) : createReview(target.listingId, payload)));
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось отправить отзыв"));
      setPending(false);
    }
  };

  return {
    rating,
    changeRating,
    text,
    setText,
    anonymous,
    setAnonymous,
    photos,
    setPhotos,
    ratingError,
    error,
    pending,
    submit,
  };
};
