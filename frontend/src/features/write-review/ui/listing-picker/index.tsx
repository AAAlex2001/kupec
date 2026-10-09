"use client";

import EmptyState from "@/shared/ui/empty-state";
import { StarIcon } from "@/shared/ui/icons";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import { targetFromListing } from "../../lib/targets";
import { useReviewable } from "../../model/use-reviewable";
import type { ReviewTarget } from "../../model/types";
import TargetPreview from "../target-preview";
import styles from "./style.module.scss";

type ListingPickerProps = {
  onPick: (target: ReviewTarget) => void;
};

/** Выбор объявления для отзыва из тех, по которым была переписка. */
const ListingPicker = ({ onPick }: ListingPickerProps) => {
  const { listings, error } = useReviewable();

  if (error) return <Notice tone="error">{error}</Notice>;
  if (!listings) return <Loader />;

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={<StarIcon />}
        title="Пока не о чем оставить отзыв"
        text="Отзыв можно оставить после переписки с автором объявления."
      />
    );
  }

  return (
    <div className={styles.picker}>
      <p className={styles.text}>О каком объявлении отзыв?</p>

      {listings.map((listing) => (
        <button
          key={listing.id}
          type="button"
          className={styles.option}
          onClick={() => onPick(targetFromListing(listing))}
        >
          <TargetPreview target={targetFromListing(listing)} />
        </button>
      ))}
    </div>
  );
};

export default ListingPicker;
