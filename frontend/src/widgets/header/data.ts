import { FAVORITES_PATH, HELP_PATH, MESSAGES_PATH, RULES_PATH } from "@/shared/config/routes";
import { HeartIcon, MessageCircleIcon } from "@/shared/ui/icons";

export const SERVICE_LINKS = [
  { label: "Помощь", href: HELP_PATH },
  { label: "Правила площадки", href: RULES_PATH },
];

export const PUBLISH_LABEL = "Разместить объявление";

export const HEADER_ACTIONS = [
  { label: "Избранное", href: FAVORITES_PATH, Icon: HeartIcon, requiresAuth: true },
  { label: "Сообщения", href: MESSAGES_PATH, Icon: MessageCircleIcon, requiresAuth: true },
];
