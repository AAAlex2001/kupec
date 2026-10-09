import type { Category } from "@/entities/listing";
import { categoryPath, HOME_PATH } from "@/shared/config/routes";

/** Путь по каталогу для хлебных крошек: «Главная / Продукты / Соленья», все пункты — ссылки. */
export const catalogCrumbs = (path: Category[]) => [
  { label: "Главная", href: HOME_PATH },
  ...path.map((category) => ({ label: category.name, href: categoryPath(category.slug) })),
];
