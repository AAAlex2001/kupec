"use client";

import { useEffect, useState } from "react";
import type { AdminCategory } from "@/entities/category";
import {
  fetchCategoryUnits,
  fetchUnits,
  saveCategoryUnits,
  type CategoryUnits,
  type Unit,
} from "@/entities/unit";
import { errorMessage } from "@/shared/lib/errors";

/** Единицы цены категории в админке: какие отмечены свои и что берётся у родителя. */
export const useCategoryUnits = (category: AdminCategory, onSaved: () => void) => {
  const [all, setAll] = useState<Unit[] | null>(null);
  const [bound, setBound] = useState<CategoryUnits | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([fetchUnits(), fetchCategoryUnits(category.id)])
      .then(([units, current]) => {
        if (!active) return;
        setAll(units.filter((unit) => unit.kind === category.kind));
        setBound(current);
        setSelected(current.own.map((unit) => String(unit.id)));
      })
      .catch((failure) => active && setError(errorMessage(failure, "Не удалось загрузить")));

    return () => {
      active = false;
    };
  }, [category.id, category.kind]);

  const save = async () => {
    setPending(true);
    setError(null);

    try {
      await saveCategoryUnits(category.id, selected.map(Number));
      onSaved();
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось сохранить"));
    }

    setPending(false);
  };

  return { all, bound, selected, setSelected, pending, error, save };
};
