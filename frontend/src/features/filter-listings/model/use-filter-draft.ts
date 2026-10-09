"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { filtersQuery, type Filters } from "../lib/params";

/** Черновик фильтров: меняется в панели и попадает в адрес страницы по «Показать». */
export const useFilterDraft = (filters: Filters, onApplied?: () => void) => {
  const router = useRouter();
  const pathname = usePathname();
  const [draft, setDraft] = useState(filters);

  const set = (key: string, value: string) =>
    setDraft((current) => {
      const next = { ...current };
      if (value) next[key] = value;
      else delete next[key];

      return next;
    });

  const go = (next: Filters) => {
    const query = filtersQuery(next);
    router.push(query ? `${pathname}?${query}` : pathname);
    onApplied?.();
  };

  const apply = () => go(draft);

  const reset = () => {
    const kept: Filters = filters.q ? { q: filters.q } : {};
    setDraft(kept);
    go(kept);
  };

  return { draft, set, apply, reset };
};
