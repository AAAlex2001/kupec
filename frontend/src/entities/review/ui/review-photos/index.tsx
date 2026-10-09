"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "@/shared/ui/lightbox";
import type { ReviewPhoto } from "../../model/types";
import styles from "./style.module.scss";

type ReviewPhotosProps = {
  photos: ReviewPhoto[];
};

/** Фото к отзыву миниатюрами. По клику открываются на весь экран. */
const ReviewPhotos = ({ photos }: ReviewPhotosProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={styles.photos}>
      {photos.map((photo, index) => (
        <button
          key={photo.id}
          type="button"
          className={styles.photo}
          aria-label={`Фото ${index + 1}`}
          onClick={() => setOpenIndex(index)}
        >
          <Image className={styles.image} src={photo.url} alt="" fill sizes="96px" unoptimized />
        </button>
      ))}

      <Lightbox
        photos={photos.map((photo) => photo.url)}
        openIndex={openIndex}
        onClose={() => setOpenIndex(null)}
      />
    </div>
  );
};

export default ReviewPhotos;
