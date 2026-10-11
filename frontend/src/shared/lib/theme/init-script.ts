import { THEME_STORAGE_KEY } from "./config";

/** Выполняется до отрисовки страницы, чтобы сохранённая тема не мигала. */
export const THEME_INIT_SCRIPT = `
  (function () {
    var preference = 'light';
    try {
      var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
      if (stored === 'light' || stored === 'dark') preference = stored;
    } catch (_) {}
    var root = document.documentElement;
    root.dataset.theme = preference;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(root).getPropertyValue('--color-page').trim();
  })();
`;
