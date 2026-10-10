import type { Post } from "@/entities/post";
import { listingPath, postPath } from "@/shared/config/routes";
import type { MenuAction } from "@/shared/ui/action-menu";
import {
  BasketIcon,
  ExternalLinkIcon,
  FlagIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "@/shared/ui/icons";

type AuthorHandlers = {
  following: boolean;
  toggleFollow: () => void;
  report: () => void;
};

/** Пункты меню чужого поста: открыть, подписка, первое объявление из поста, если есть, и «Пожаловаться». */
export const authorActions = (post: Post, { following, toggleFollow, report }: AuthorHandlers) => {
  const followAction: MenuAction = following
    ? { label: "Отписаться от автора", Icon: UserMinusIcon, onClick: toggleFollow }
    : { label: "Подписаться на автора", Icon: UserPlusIcon, onClick: toggleFollow };

  const actions: MenuAction[] = [
    { label: "Открыть публикацию", Icon: ExternalLinkIcon, href: postPath(post.id) },
    followAction,
  ];

  const listing = post.listings[0];
  if (listing) {
    actions.push({ label: "Перейти к объявлению", Icon: BasketIcon, href: listingPath(listing.id) });
  }

  actions.push({ label: "Пожаловаться", Icon: FlagIcon, danger: true, onClick: report });

  return actions;
};
