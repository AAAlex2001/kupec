import { fetchFeed, fetchFollowingFeed } from "@/entities/post";

export type FeedTab = "all" | "following";

export const FEED_TABS: { value: FeedTab; label: string }[] = [
  { value: "all", label: "Для вас" },
  { value: "following", label: "Подписки" },
];

export const FEED_LOADERS = {
  all: fetchFeed,
  following: fetchFollowingFeed,
};

export const FEED_EMPTY = {
  all: {
    title: "В ленте пока пусто",
    text: "Станьте первым: расскажите о своих товарах и услугах.",
  },
  following: {
    title: "Здесь появятся посты ваших подписок",
    text: "Подпишитесь на автора через меню «⋯» у его поста.",
  },
};
