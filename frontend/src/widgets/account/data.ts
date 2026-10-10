import type { ComponentType } from "react";
import {
  ADMIN_PATH,
  FAVORITES_PATH,
  FEED_PATH,
  MESSAGES_PATH,
  MY_LISTINGS_PATH,
  MY_REVIEWS_PATH,
  POSTS_PATH,
  NEW_LISTING_PATH,
  NOTIFICATIONS_PATH,
  SETTINGS_PATH,
} from "@/shared/config/routes";
import {
  BasketIcon,
  BellIcon,
  FileTextIcon,
  HeartIcon,
  MessageCircleIcon,
  SettingsIcon,
  ShieldIcon,
  StarIcon,
} from "@/shared/ui/icons";
import type { IconProps } from "@/shared/ui/icons/types";

export type AccountSection = {
  href: string;
  label: string;
  Icon: ComponentType<IconProps>;
  ownTitle?: boolean;
  tag?: string;
  paths?: string[];
  action?: { label: string; href: string };
};

export const ACCOUNT_SECTIONS: AccountSection[] = [
  {
    href: MY_LISTINGS_PATH,
    label: "Мои объявления",
    Icon: BasketIcon,
    action: { label: "Разместить объявление", href: NEW_LISTING_PATH },
  },
  { href: MESSAGES_PATH, label: "Сообщения", Icon: MessageCircleIcon, ownTitle: true },
  { href: NOTIFICATIONS_PATH, label: "Уведомления", Icon: BellIcon, ownTitle: true },
  { href: FAVORITES_PATH, label: "Избранное", Icon: HeartIcon, ownTitle: true },
  { href: MY_REVIEWS_PATH, label: "Мои отзывы", Icon: StarIcon, ownTitle: true },
  {
    href: FEED_PATH,
    label: "Публикации",
    Icon: FileTextIcon,
    ownTitle: true,
    tag: "Новое",
    paths: [POSTS_PATH],
  },
  { href: SETTINGS_PATH, label: "Настройки", Icon: SettingsIcon },
];

export const ADMIN_LINK: AccountSection = { href: ADMIN_PATH, label: "Админка", Icon: ShieldIcon };
