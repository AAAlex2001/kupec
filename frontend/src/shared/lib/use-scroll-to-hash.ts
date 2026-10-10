"use client";

import { useEffect } from "react";

/** Плавно прокрутить к элементу с этим id, когда он появился, если в адресе стоит #id. */
export const useScrollToHash = (id: string, ready: boolean) => {
  useEffect(() => {
    if (!ready || window.location.hash !== `#${id}`) return;

    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, [id, ready]);
};
