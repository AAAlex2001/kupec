"use client";

import { useEffect } from "react";
import { watchTheme } from "@/shared/lib/theme/store";

/** Следит за сменой темы в других вкладках. Ничего не рисует. */
const ThemeController = () => {
  useEffect(watchTheme, []);
  return null;
};

export default ThemeController;
