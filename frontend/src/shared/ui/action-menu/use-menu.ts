"use client";

import { useEffect, useState, type RefObject } from "react";

/** Открыто ли меню. Закрывается кликом мимо элемента и по Escape. */
export const useMenu = (element: RefObject<HTMLElement | null>) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (event: MouseEvent) => {
      if (!element.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [element, open]);

  return {
    open,
    toggle: () => setOpen(!open),
    close: () => setOpen(false),
  };
};
