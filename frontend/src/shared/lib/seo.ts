import { SITE_NAME, SITE_URL } from "@/shared/config/site";

const DESCRIPTION_LENGTH = 160;

/** Общая картинка превью ссылки: логотип и корзинка. */
export const OG_IMAGE = { url: "/og.png", width: 1200, height: 630, alt: SITE_NAME };

/** Общее для превью ссылок всех страниц: Next заменяет openGraph страницы целиком, а не дополняет корневой. */
export const OG_BASE = { siteName: SITE_NAME, locale: "ru_RU", images: [OG_IMAGE] };

/** Картинка превью страницы: своя, а если её нет — общая. */
export const ogImages = (url: string | null) => (url ? [url] : [OG_IMAGE]);

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

/** Текст без тегов из HTML поста — для заголовков и описаний страниц. */
export const textFromHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (entity) => ENTITIES[entity])
    .replace(/\s+/g, " ")
    .trim();

/** Текст не длиннее length символов: лишнее отрезается с многоточием. */
export const shorten = (text: string, length = DESCRIPTION_LENGTH) =>
  text.length <= length ? text : `${text.slice(0, length - 1).trimEnd()}…`;

/** Полный адрес страницы или картинки на сайте: «/posts/3» → «https://kupec.ru/posts/3». */
export const absoluteUrl = (path: string) => `${SITE_URL}${path}`;
