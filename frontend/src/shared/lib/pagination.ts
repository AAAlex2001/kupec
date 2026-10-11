/** Номер страницы из ?page=: всё, что не целое число от 2, — первая страница. */
export const pageNumberFrom = (value: string | string[] | undefined) => {
  const number = Number(Array.isArray(value) ? value[0] : value);

  return Number.isInteger(number) && number > 1 ? number : 1;
};

/** Адрес страницы списка: у первой нет ?page, чтобы у неё был один адрес. */
export const pagePath = (path: string, pageNumber: number) =>
  pageNumber > 1 ? `${path}?page=${pageNumber}` : path;

/** Адрес страницы, с которой начинается запись под номером offset. */
export const offsetPath = (path: string, offset: number, pageSize: number) =>
  pagePath(path, Math.floor(offset / pageSize) + 1);
