"use client";

import { useEffect, useState } from "react";
import { fetchAdminCategories, type AdminCategory } from "@/entities/category";
import { errorMessage } from "@/shared/lib/errors";

/** Дерево категорий для админки. reload перечитывает его после любого изменения. */
export const useAdminCategories = () => {
  const [tree, setTree] = useState<AdminCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;

    fetchAdminCategories()
      .then((found) => {
        if (!active) return;
        setTree(found);
        setError(null);
      })
      .catch((failure) => active && setError(errorMessage(failure, "Не удалось загрузить")));

    return () => {
      active = false;
    };
  }, [version]);

  const reload = () => setVersion((value) => value + 1);

  return { tree, error, reload };
};
