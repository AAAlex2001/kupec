/** Адрес с протоколом: «ya.ru» → «https://ya.ru». */
export const withProtocol = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);
