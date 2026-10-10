import { FEED_PATH, MY_POSTS_PATH, REPOSTS_PATH, SAVED_POSTS_PATH } from "@/shared/config/routes";
import { BookmarkIcon, NewspaperIcon, RepostIcon, SquarePenIcon } from "@/shared/ui/icons";

export const POSTS_SECTIONS = [
  { href: FEED_PATH, label: "Лента", Icon: NewspaperIcon },
  { href: MY_POSTS_PATH, label: "Мои публикации", Icon: SquarePenIcon },
  { href: SAVED_POSTS_PATH, label: "Сохранённое", Icon: BookmarkIcon },
  { href: REPOSTS_PATH, label: "Репосты", Icon: RepostIcon },
];
