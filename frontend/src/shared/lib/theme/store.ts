"use client";

import { useSyncExternalStore } from "react";
import { reportError } from "@/shared/lib/report-error";
import {
  isThemePreference,
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "./config";

/** Тема, которая сейчас стоит на странице. */
const currentPreference = (): ThemePreference => {
  const value = document.documentElement.dataset.theme;
  return isThemePreference(value) ? value : "light";
};

/** Сохранённая тема. Нет или хранилище недоступно — светлая. */
export const readStoredTheme = (): ThemePreference => {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(value) ? value : "light";
  } catch {
    return "light";
  }
};

/** Поставить тему на страницу, перекрасить строку браузера и сообщить подписчикам. */
export const applyTheme = (preference: ThemePreference) => {
  const root = document.documentElement;
  root.dataset.theme = preference;

  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) {
    meta.content = getComputedStyle(root).getPropertyValue("--color-page").trim();
  }
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
};

/** Выбрать тему: запомнить и сразу применить. Без хранилища тема работает до закрытия вкладки. */
export const setThemePreference = (preference: ThemePreference) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch (failure) {
    reportError(failure);
  }
  applyTheme(preference);
};

/** Подписка на смену темы для useSyncExternalStore. */
const subscribe = (listener: () => void) => {
  window.addEventListener(THEME_CHANGE_EVENT, listener);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, listener);
};

/** Текущая тема. На сервере — светлая. */
export const useThemePreference = () =>
  useSyncExternalStore(subscribe, currentPreference, (): ThemePreference => "light");

/** Синхронизирует выбор темы в других вкладках. */
export const watchTheme = () => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY || event.key === null) {
      applyTheme(readStoredTheme());
    }
  };

  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
};
