import type { AccountSection } from "../data";

/** Раздел кабинета, где сейчас пользователь: по ссылке раздела или по его дополнительным адресам. */
export const findSection = (sections: AccountSection[], pathname: string) =>
  sections.find(({ href, paths = [] }) =>
    [href, ...paths].some((path) => pathname.startsWith(path)),
  );
