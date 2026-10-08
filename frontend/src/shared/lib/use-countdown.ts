"use client";

import { useEffect, useState } from "react";

/** Обратный отсчёт секунд с момента монтирования. Для нового отсчёта компонент перемонтируют по key. */
export const useCountdown = (seconds: number) => {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    const timer = setInterval(() => setLeft((value) => Math.max(0, value - 1)), 1000);

    return () => clearInterval(timer);
  }, []);

  return left;
};
