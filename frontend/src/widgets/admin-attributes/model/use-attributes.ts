"use client";

import { useEffect, useState } from "react";
import { fetchAttributes, type Attribute } from "@/entities/attribute";
import { errorMessage } from "@/shared/lib/errors";

/** Справочник атрибутов. reload перечитывает его после любого изменения. */
export const useAttributes = () => {
  const [attributes, setAttributes] = useState<Attribute[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;

    fetchAttributes()
      .then((found) => {
        if (!active) return;
        setAttributes(found);
        setError(null);
      })
      .catch((failure) => active && setError(errorMessage(failure, "Не удалось загрузить")));

    return () => {
      active = false;
    };
  }, [version]);

  const reload = () => setVersion((value) => value + 1);

  return { attributes, error, reload };
};
