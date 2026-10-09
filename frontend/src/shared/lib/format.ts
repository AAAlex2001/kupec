const NUMBER = new Intl.NumberFormat("ru-RU");

const DATE = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });

const DAY = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });

const SHORT_DAY = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" });

const TIME = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" });

/** Число с пробелами между разрядами: «234 324». */
export const formatNumber = (value: number) => NUMBER.format(value);

/** Цена в рублях: «1 800 ₽». */
export const formatRub = (value: number | string) => `${NUMBER.format(Number(value))} ₽`;

/** Дата словами: «5 октября 2026». */
export const formatDate = (value: string) => DATE.format(new Date(value)).replace(" г.", "");

/** Время: «14:32». */
export const formatTime = (value: string) => TIME.format(new Date(value));

/** Сколько дней прошло с даты по календарю: сегодня — 0, вчера — 1. */
export const daysAgo = (value: string) => {
  const day = new Date(value);
  const today = new Date();
  const start = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return Math.round((start(today).getTime() - start(day).getTime()) / 86_400_000);
};

/** День для разделителя в переписке: «Сегодня», «Вчера», «5 октября». */
export const formatDay = (value: string) => {
  const days = daysAgo(value);

  if (days === 0) return "Сегодня";
  if (days === 1) return "Вчера";

  return DAY.format(new Date(value));
};

/** Время в списке диалогов: сегодня — «14:32», вчера — «Вчера», раньше — «5 окт.». */
export const formatMoment = (value: string) => {
  const days = daysAgo(value);

  if (days === 0) return formatTime(value);
  if (days === 1) return "Вчера";

  return SHORT_DAY.format(new Date(value));
};

/** Слово по числу: plural(124, ["просмотр", "просмотра", "просмотров"]) → «просмотра». */
export const plural = (count: number, forms: [string, string, string]) => {
  const tens = count % 100;
  const units = count % 10;

  if (tens > 10 && tens < 20) return forms[2];
  if (units === 1) return forms[0];
  if (units >= 2 && units <= 4) return forms[1];

  return forms[2];
};
