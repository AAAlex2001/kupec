"use client";

import { useState } from "react";
import { deleteCategory, moveCategory, type AdminCategory } from "@/entities/category";
import { errorMessage } from "@/shared/lib/errors";

export type CategoryDialog = "edit" | "child" | "attributes" | "units" | "delete" | null;

/** Действия над категорией в админке. После успеха окно закрывается и дерево обновляется. */
export const useCategoryActions = (category: AdminCategory, onDone: () => void) => {
  const [dialog, setDialog] = useState<CategoryDialog>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<unknown>) => {
    setPending(true);
    setError(null);

    try {
      await action();
      setDialog(null);
      onDone();
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось выполнить действие"));
    }

    setPending(false);
  };

  const saved = () => {
    setDialog(null);
    onDone();
  };

  return {
    dialog,
    setDialog,
    pending,
    error,
    saved,
    moveUp: () => run(() => moveCategory(category.id, "up")),
    moveDown: () => run(() => moveCategory(category.id, "down")),
    remove: () => run(() => deleteCategory(category.id)),
  };
};
