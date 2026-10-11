"use client";

import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { useState } from "react";
import Lightbox from "@/shared/ui/lightbox";
import GalleryPhoto from "./ui/gallery-photo";
import GalleryThumbs from "./ui/gallery-thumbs";
import styles from "./style.module.scss";

type GalleryProps = {
  photos: string[];
  alt?: string;
};

/** Фото объявления: большое фото листается на Keen Slider, по клику открывается на весь экран. alt — описание фото для поиска по картинкам. */
const Gallery = ({ photos, alt = "" }: GalleryProps) => {
  const [current, setCurrent] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    slideChanged: (instance) => setCurrent(instance.track.details.rel),
  });

  if (photos.length === 0) return <div className={styles.empty} />;

  return (
    <div className={styles.gallery}>
      <div ref={sliderRef} className="keen-slider">
        {photos.map((src, index) => (
          <GalleryPhoto key={src} src={src} alt={alt} onOpen={() => setOpenIndex(index)} />
        ))}
      </div>

      <GalleryThumbs
        photos={photos}
        current={current}
        onSelect={(index) => slider.current?.moveToIdx(index)}
      />

      <Lightbox photos={photos} openIndex={openIndex} onClose={() => setOpenIndex(null)} />
    </div>
  );
};

export default Gallery;
