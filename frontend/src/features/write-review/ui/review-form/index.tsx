"use client";

import { useId } from "react";
import { deleteReviewPhoto, uploadReviewPhoto, type Review } from "@/entities/review";
import Button from "@/shared/ui/button";
import Checkbox from "@/shared/ui/checkbox";
import Field from "@/shared/ui/field";
import Notice from "@/shared/ui/notice";
import PhotoPicker from "@/shared/ui/photo-picker";
import StarRating from "@/shared/ui/star-rating";
import Textarea from "@/shared/ui/textarea";
import { useReviewForm } from "../../model/use-review-form";
import type { ReviewTarget } from "../../model/types";
import TargetPreview from "../target-preview";
import styles from "./style.module.scss";

const MAX_PHOTOS = 10;

type ReviewFormProps = {
  target: ReviewTarget;
  review?: Review;
  onSaved: (review: Review) => void;
};

/** Форма отзыва из макета: оценка, комментарий, фото, анонимность и отправка. */
const ReviewForm = ({ target, review, onSaved }: ReviewFormProps) => {
  const id = useId();
  const form = useReviewForm(target, review, onSaved);

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        form.submit();
      }}
    >
      <TargetPreview target={target} />

      <div className={styles.rating}>
        <p className={styles.label}>Общая оценка *</p>
        <StarRating value={form.rating} onChange={form.changeRating} invalid={Boolean(form.ratingError)} />
        {form.ratingError && <p className={styles.error}>{form.ratingError}</p>}
      </div>

      <Field label="Комментарий · необязательно" htmlFor={id}>
        <Textarea
          id={id}
          value={form.text}
          onChange={form.setText}
          placeholder="Расскажите о вашем опыте"
          maxLength={2000}
        />
      </Field>

      <PhotoPicker
        title={`Фотографии · до ${MAX_PHOTOS}`}
        photos={form.photos}
        max={MAX_PHOTOS}
        upload={uploadReviewPhoto}
        remove={deleteReviewPhoto}
        onChange={form.setPhotos}
      />

      <Checkbox checked={form.anonymous} onChange={form.setAnonymous}>
        Опубликовать анонимно
      </Checkbox>

      <p className={styles.hint}>
        Отзыв появится после проверки. Расскажите о личном опыте, не указывайте чужие контакты.
      </p>

      <Button type="submit" loading={form.pending}>
        {form.pending ? "Отправляем отзыв…" : "Отправить отзыв"}
      </Button>

      {form.error && <Notice tone="error">{form.error}</Notice>}
    </form>
  );
};

export default ReviewForm;
