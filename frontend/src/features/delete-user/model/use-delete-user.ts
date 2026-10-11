"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAdminUser } from "@/entities/user";
import { ADMIN_USERS_PATH } from "@/shared/config/routes";
import { errorMessage } from "@/shared/lib/errors";

/** Удаление пользователя из админки: окно подтверждения, затем возврат к списку пользователей. */
export const useDeleteUser = (userId: number) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    setPending(true);
    setError(null);

    try {
      await deleteAdminUser(userId);
      router.push(ADMIN_USERS_PATH);
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось удалить пользователя"));
      setPending(false);
    }
  };

  return { open, pending, error, show: () => setOpen(true), close: () => setOpen(false), remove };
};
