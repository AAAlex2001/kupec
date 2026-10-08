import {
  FAVORITES_PATH,
  HOME_PATH,
  MESSAGES_PATH,
  MY_LISTINGS_PATH,
  MY_REVIEWS_PATH,
  NEW_LISTING_PATH,
  SETTINGS_PATH,
} from "@/shared/config/routes";
import { HeartIcon, MessageCircleIcon, RowsIcon, SettingsIcon, StarIcon } from "@/shared/ui/icons";

export const ACCOUNT_SECTIONS = [
  {
    href: MY_LISTINGS_PATH,
    label: "Мои объявления",
    Icon: RowsIcon,
    action: { label: "Разместить объявление", href: NEW_LISTING_PATH },
  },
  { href: MESSAGES_PATH, label: "Сообщения", Icon: MessageCircleIcon, ownTitle: true },
  { href: FAVORITES_PATH, label: "Избранное", Icon: HeartIcon, ownTitle: true },
  { href: MY_REVIEWS_PATH, label: "Мои отзывы", Icon: StarIcon },
  { href: SETTINGS_PATH, label: "Настройки", Icon: SettingsIcon },
];

export const EMPTY_STATES = {
  reviews: {
    Icon: StarIcon,
    title: "Вы ещё не оставляли отзывов",
    text: "Отзыв можно оставить после сделки — он поможет другим выбрать продавца.",
    action: { label: "Все объявления", href: HOME_PATH },
  },
};

export type EmptySection = keyof typeof EMPTY_STATES;
