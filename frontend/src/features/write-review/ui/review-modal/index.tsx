"use client";

import { useState } from "react";
import type { Review } from "@/entities/review";
import Modal from "@/shared/ui/modal";
import Title from "@/shared/ui/title";
import type { ReviewTarget } from "../../model/types";
import ListingPicker from "../listing-picker";
import ReviewForm from "../review-form";
import ReviewSent from "../review-sent";
import styles from "./style.module.scss";

type ReviewModalProps = {
  open: boolean;
  target?: ReviewTarget;
  review?: Review;
  onClose: () => void;
  onSaved?: (review: Review) => void;
};

/** Окно «Написать отзыв»: выбор объявления, если оно не задано, форма и итог. */
const ReviewModal = ({ open, target, review, onClose, onSaved }: ReviewModalProps) => {
  const [picked, setPicked] = useState<ReviewTarget | null>(null);
  const [saved, setSaved] = useState<Review | null>(null);
  const current = target ?? picked;

  const close = () => {
    setPicked(null);
    setSaved(null);
    onClose();
  };

  const save = (result: Review) => {
    setSaved(result);
    onSaved?.(result);
  };

  return (
    <Modal open={open} onClose={close} ariaLabel="Написать отзыв">
      {open && (
        <div className={styles.content}>
          <Title>{review ? "Изменить отзыв" : "Написать отзыв"}</Title>

          {saved && <ReviewSent review={saved} onDone={close} />}
          {!saved && !current && <ListingPicker onPick={setPicked} />}
          {!saved && current && <ReviewForm target={current} review={review} onSaved={save} />}
        </div>
      )}
    </Modal>
  );
};

export default ReviewModal;
