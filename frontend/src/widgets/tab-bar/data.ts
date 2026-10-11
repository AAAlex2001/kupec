import { MESSAGES_PATH, NEW_LISTING_PATH } from "@/shared/config/routes";
import { MessageCircleIcon, PlusIcon } from "@/shared/ui/icons";

export const TAB_BAR_ITEMS = [
  { label: "Разместить", href: NEW_LISTING_PATH, Icon: PlusIcon, accent: true, requiresAuth: true },
  { label: "Сообщения", href: MESSAGES_PATH, Icon: MessageCircleIcon, requiresAuth: true },
];
