"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { logout, useUser } from "@/entities/user";
import { HOME_PATH } from "@/shared/config/routes";

/** Выход на этом устройстве: сессия удаляется, пользователь уходит на главную. */
export const useLogout = () => {
  const router = useRouter();
  const { setUser } = useUser();
  const [pending, setPending] = useState(false);

  const signOut = async () => {
    setPending(true);

    try {
      await logout();
    } finally {
      setUser(null);
      setPending(false);
      router.push(HOME_PATH);
      router.refresh();
    }
  };

  return { pending, signOut };
};
