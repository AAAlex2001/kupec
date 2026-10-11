export const THEME_STORAGE_KEY = "kupec-theme";
export const THEME_CHANGE_EVENT = "kupec-theme-change";

export type ThemePreference = "light" | "dark";

/** Строка — одна из тем сайта. */
export const isThemePreference = (value: unknown): value is ThemePreference =>
  value === "light" || value === "dark";
