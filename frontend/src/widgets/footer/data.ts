import {
  FAVORITES_PATH,
  FEED_PATH,
  HELP_PATH,
  HOME_PATH,
  MESSAGES_PATH,
  MY_LISTINGS_PATH,
  MY_POSTS_PATH,
  MY_REVIEWS_PATH,
  NEW_POST_PATH,
  PERSONAL_DATA_PATH,
  PRIVACY_PATH,
  REPOSTS_PATH,
  RULES_PATH,
  SAVED_POSTS_PATH,
  SETTINGS_PATH,
  TERMS_PATH,
} from "@/shared/config/routes";

export const ALL_LISTINGS_LINK = { label: "Все объявления", href: HOME_PATH };

export const FOOTER_GROUPS = [
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
    title: "Публикации",
    links: [
      { label: "Лента", href: FEED_PATH },
      { label: "Написать пост", href: NEW_POST_PATH },
      { label: "Мои публикации", href: MY_POSTS_PATH },
      { label: "Сохранённое", href: SAVED_POSTS_PATH },
      { label: "Репосты", href: REPOSTS_PATH },
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
  { label: "Политика конфиденциальности", href: PRIVACY_PATH },
  { label: "Обработка персональных данных", href: PERSONAL_DATA_PATH },
];

export const COPYRIGHT = "Частные объявления по всей России";
