import { NEW_LISTING_PATH } from "@/shared/config/routes";

export const EMPTY_TABS = {
  published: {
    title: "У вас пока нет активных объявлений",
    text: "Разместите первое объявление — товар или услугу. Это бесплатно.",
    action: { label: "Разместить объявление", href: NEW_LISTING_PATH },
  },
  draft: {
    title: "Черновиков нет",
    text: "Сохраняйте недописанные объявления черновиком — они появятся здесь.",
    action: null,
  },
  archived: {
    title: "Снятых объявлений нет",
    text: "Сюда попадают объявления, которые вы сняли с публикации.",
    action: null,
  },
};

export const NOTHING_FOUND = {
  title: "Ничего не нашлось",
  text: "Попробуйте другое название.",
};
