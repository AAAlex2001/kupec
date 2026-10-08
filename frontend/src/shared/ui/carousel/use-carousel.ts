"use client";

import { useKeenSlider } from "keen-slider/react";
import { useState } from "react";

/** Слайдер Keen Slider и можно ли листать назад и вперёд. */
export const useCarousel = () => {
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    mode: "free-snap",
    slides: { perView: "auto", spacing: 12 },
    detailsChanged: (instance) => {
      const { abs, minIdx, maxIdx } = instance.track.details;
      setCanPrev(abs > minIdx);
      setCanNext(abs < maxIdx);
    },
  });

  const prev = () => slider.current?.prev();
  const next = () => slider.current?.next();

  return { sliderRef, canPrev, canNext, prev, next };
};
