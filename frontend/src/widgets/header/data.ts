import { FAVORITES_PATH, HELP_PATH, HOME_PATH, MESSAGES_PATH } from "@/shared/config/routes";
import { HeartIcon, MessageCircleIcon } from "@/shared/ui/icons";

export const DEFAULT_CITY = "Иркутск";

export const HELP_LINK = { label: "Помощь", href: HELP_PATH };

export const PUBLISH_LABEL = "Разместить объявление";

export const HEADER_ACTIONS = [
  { label: "Избранное", href: FAVORITES_PATH, Icon: HeartIcon, requiresAuth: true },
  { label: "Сообщения", href: MESSAGES_PATH, Icon: MessageCircleIcon, requiresAuth: true },
];

export const ALL_LISTINGS_LINK = { label: "Все объявления", href: HOME_PATH };
