/** Дробное число из ввода: запятая становится точкой, остаются цифры и первая точка. */
export const decimalInput = (text: string): string => {
  const clean = text.replace(/,/g, ".").replace(/[^\d.]/g, "");
  const point = clean.indexOf(".");

  if (point < 0) return clean;

  return clean.slice(0, point + 1) + clean.slice(point + 1).replace(/\./g, "");
};
