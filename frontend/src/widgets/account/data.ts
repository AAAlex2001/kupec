import {
  ADMIN_PATH,
  FAVORITES_PATH,
  MESSAGES_PATH,
  MY_LISTINGS_PATH,
  MY_REVIEWS_PATH,
  NEW_LISTING_PATH,
  SETTINGS_PATH,
} from "@/shared/config/routes";
import { BasketIcon, HeartIcon, MessageCircleIcon, SettingsIcon, StarIcon } from "@/shared/ui/icons";

export const ACCOUNT_SECTIONS = [
  {
    href: MY_LISTINGS_PATH,
    label: "Мои объявления",
    Icon: BasketIcon,
    action: { label: "Разместить объявление", href: NEW_LISTING_PATH },
  },
  { href: MESSAGES_PATH, label: "Сообщения", Icon: MessageCircleIcon, ownTitle: true },
  { href: FAVORITES_PATH, label: "Избранное", Icon: HeartIcon, ownTitle: true },
  { href: MY_REVIEWS_PATH, label: "Мои отзывы", Icon: StarIcon, ownTitle: true },
  { href: SETTINGS_PATH, label: "Настройки", Icon: SettingsIcon },
];

export const ADMIN_LINK = { href: ADMIN_PATH, label: "Админка", Icon: SettingsIcon };
