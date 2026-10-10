"use client";

import cn from "classnames";
import { useKeenSlider } from "keen-slider/react";
import Image from "next/image";
import { useEffect } from "react";
import styles from "./style.module.scss";

const THUMBS_GAP = 12;

type GalleryThumbsProps = {
  photos: string[];
  current: number;
  onSelect: (index: number) => void;
};

/** Миниатюры под большим фото слайдером: не влезают — листаются. Текущая обведена и подкручивается в видимую часть. */
const GalleryThumbs = ({ photos, current, onSelect }: GalleryThumbsProps) => {
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    mode: "free-snap",
    slides: { perView: "auto", spacing: THUMBS_GAP },
  });

  useEffect(() => {
    slider.current?.moveToIdx(current);
  }, [current, slider]);

  return (
    <div ref={sliderRef} className="keen-slider">
      {photos.map((src, index) => (
        <button
          key={src}
          type="button"
          className={cn("keen-slider__slide", styles.thumb, index === current && styles.active)}
          aria-label={`Фото ${index + 1}`}
          aria-current={index === current}
          onClick={() => onSelect(index)}
        >
          <Image className={styles.image} src={src} alt="" fill sizes="120px" unoptimized />
        </button>
      ))}
    </div>
  );
};

export default GalleryThumbs;
