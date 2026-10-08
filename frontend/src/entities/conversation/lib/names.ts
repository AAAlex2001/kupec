import type { Companion } from "../model/types";

/** Имя собеседника. Пока он его не указал — «Пользователь». */
export const companionName = (companion: Companion) => companion.name ?? "Пользователь";

/** Буква для аватара собеседника без фото. */
export const companionLetter = (companion: Companion) =>
  companionName(companion).charAt(0).toUpperCase();
