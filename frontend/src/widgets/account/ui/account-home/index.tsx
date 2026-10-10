"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DESKTOP_QUERY } from "@/shared/config/breakpoints";
import { SETTINGS_PATH } from "@/shared/config/routes";

/** Вход в кабинет. До ПК здесь список разделов — его рисует меню кабинета. На ПК меню уже слева, поэтому — в настройки. */
const AccountHome = () => {
  const router = useRouter();

  useEffect(() => {
    if (window.matchMedia(DESKTOP_QUERY).matches) router.replace(SETTINGS_PATH);
  }, [router]);

  return null;
};

export default AccountHome;
