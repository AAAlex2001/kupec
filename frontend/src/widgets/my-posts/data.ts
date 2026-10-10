import type { PostStatus } from "@/entities/post";

export const TABS: { value: PostStatus; label: string }[] = [
  { value: "published", label: "Публикации" },
  { value: "draft", label: "Черновики" },
];

export const TAB_HINTS: Record<PostStatus, string> = {
  published: "Ваши опубликованные записи. Управление — в меню публикации.",
  draft: "Черновики видите только вы. Опубликовать — через «Изменить» в меню.",
  hidden: "Эти записи скрыты модератором.",
};
