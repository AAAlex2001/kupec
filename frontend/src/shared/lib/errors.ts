/** Текст пойманной ошибки или запасной текст, если это не Error. */
export const errorMessage = (failure: unknown, fallback: string): string =>
  failure instanceof Error ? failure.message : fallback;
