import { categoryPath } from "./routes";

export const POPULAR_CATEGORIES = [
  { label: "Массаж", slug: "massage", href: categoryPath("massage") },
  { label: "Репетиторы", slug: "tutors", href: categoryPath("tutors") },
  { label: "Грибы", slug: "mushrooms", href: categoryPath("mushrooms") },
  { label: "Ягоды", slug: "berries", href: categoryPath("berries") },
  { label: "Соленья", slug: "pickles", href: categoryPath("pickles") },
];
