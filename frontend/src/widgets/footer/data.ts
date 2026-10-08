import { POPULAR_CATEGORIES } from "@/shared/config/navigation";
import {
  FAVORITES_PATH,
  HELP_PATH,
  HOME_PATH,
  MESSAGES_PATH,
  MY_LISTINGS_PATH,
  MY_REVIEWS_PATH,
  PRIVACY_PATH,
  RULES_PATH,
  SETTINGS_PATH,
  TERMS_PATH,
} from "@/shared/config/routes";

export const FOOTER_GROUPS = [
  {
    title: "Категории",
    links: [...POPULAR_CATEGORIES, { label: "Все объявления", href: HOME_PATH }],
  },
  {
    title: "Личный кабинет",
    links: [
      { label: "Мои объявления", href: MY_LISTINGS_PATH },
      { label: "Сообщения", href: MESSAGES_PATH },
      { label: "Избранное", href: FAVORITES_PATH },
      { label: "Мои отзывы", href: MY_REVIEWS_PATH },
      { label: "Настройки", href: SETTINGS_PATH },
    ],
  },
  {
    title: "Помощь",
    links: [
      { label: "Помощь", href: HELP_PATH },
      { label: "Правила площадки", href: RULES_PATH },
    ],
  },
];

export const LEGAL_LINKS = [
  { label: "Пользовательское соглашение", href: TERMS_PATH },
  { label: "Конфиденциальность", href: PRIVACY_PATH },
];

export const COPYRIGHT = "Частные объявления Иркутской области";
