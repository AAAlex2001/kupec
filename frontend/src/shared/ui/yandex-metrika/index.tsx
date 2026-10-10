"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

/** Учитывает переходы Next.js без перезагрузки и не дублирует первый просмотр. */
export default function YandexMetrikaPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousUrl = useRef<string | null>(null);

  useEffect(() => {
    const metrika = (window as Window & {
      ym?: (id: number, method: "hit", url: string, options: { referer: string }) => void;
    }).ym;
    const url = window.location.href;
    if (!metrika || previousUrl.current === url) return;

    metrika(113599867, "hit", url, {
      referer: previousUrl.current ?? document.referrer,
    });
    previousUrl.current = url;
  }, [pathname, searchParams]);

  return null;
}
