"use client";

import { useEffect, useRef } from "react";
import { reportError } from "@/shared/lib/report-error";
import { countPostView } from "../api/posts";

const VISIBLE_AREA = "0px 0px -40% 0px";

/** Засчитывает просмотр опубликованного поста, когда он поднялся в верхние 60% экрана. Возвращает ref для карточки. */
export const usePostView = (postId: number, published: boolean) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!published || !element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;

        observer.disconnect();
        countPostView(postId).catch(reportError);
      },
      { rootMargin: VISIBLE_AREA },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [postId, published]);

  return ref;
};
