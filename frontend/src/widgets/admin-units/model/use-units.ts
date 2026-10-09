"use client";

import { useEffect, useState } from "react";
import { fetchUnits, type Unit } from "@/entities/unit";
import { errorMessage } from "@/shared/lib/errors";

/** Справочник единиц цены. reload перечитывает его после любого изменения. */
export const useUnits = () => {
  const [units, setUnits] = useState<Unit[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;

    fetchUnits()
      .then((found) => {
        if (!active) return;
        setUnits(found);
        setError(null);
      })
      .catch((failure) => active && setError(errorMessage(failure, "Не удалось загрузить")));

    return () => {
      active = false;
    };
  }, [version]);

  const reload = () => setVersion((value) => value + 1);

  return { units, error, reload };
};
