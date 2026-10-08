"use client";

import "keen-slider/keen-slider.min.css";
import { Children, type ReactNode } from "react";
import Button from "@/shared/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "@/shared/ui/icons";
import { useCarousel } from "./use-carousel";
import styles from "./style.module.scss";

type CarouselProps = {
  title: string;
  children: ReactNode;
};

/** Лента карточек с заголовком на Keen Slider. Стрелки видны, только когда есть куда листать. */
const Carousel = ({ title, children }: CarouselProps) => {
  const { sliderRef, canPrev, canNext, prev, next } = useCarousel();

  return (
    <section className={styles.carousel}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>

        <div className={styles.arrows}>
          {canPrev && (
            <Button variant="secondary" size="icon" ariaLabel="Назад" onClick={prev}>
              <ArrowLeftIcon />
            </Button>
          )}
          {canNext && (
            <Button variant="secondary" size="icon" ariaLabel="Вперёд" onClick={next}>
              <ArrowRightIcon />
            </Button>
          )}
        </div>
      </div>

      <div ref={sliderRef} className="keen-slider">
        {Children.map(children, (slide) => (
          <div className={`keen-slider__slide ${styles.slide}`}>{slide}</div>
        ))}
      </div>
    </section>
  );
};

export default Carousel;
