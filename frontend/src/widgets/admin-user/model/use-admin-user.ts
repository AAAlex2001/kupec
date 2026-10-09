"use client";

import { useEffect, useState } from "react";
import { fetchAdminUser, type AdminUser } from "@/entities/user";
import { errorMessage } from "@/shared/lib/errors";

/** Пользователь для карточки в админке. */
export const useAdminUser = (id: number) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchAdminUser(id)
      .then((found) => active && setUser(found))
      .catch((failure) => active && setError(errorMessage(failure, "Не удалось загрузить")));

    return () => {
      active = false;
    };
  }, [id]);

  return { user, error };
};
