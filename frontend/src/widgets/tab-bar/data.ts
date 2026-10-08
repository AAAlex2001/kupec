import {
  FAVORITES_PATH,
  HOME_PATH,
  MESSAGES_PATH,
  NEW_LISTING_PATH,
} from "@/shared/config/routes";
import { HeartIcon, HomeIcon, MessageCircleIcon, PlusIcon } from "@/shared/ui/icons";

export const TAB_BAR_ITEMS = [
  { label: "Главная", href: HOME_PATH, Icon: HomeIcon },
  { label: "Избранное", href: FAVORITES_PATH, Icon: HeartIcon, requiresAuth: true },
  { label: "Разместить", href: NEW_LISTING_PATH, Icon: PlusIcon, accent: true, requiresAuth: true },
  { label: "Сообщения", href: MESSAGES_PATH, Icon: MessageCircleIcon, requiresAuth: true },
];
