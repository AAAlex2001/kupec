import { load } from "@/shared/api/server";
import type { CategoryNode, CategoryPage } from "../model/types";

/** Всё дерево категорий с сервера Next.js. */
export const getCategoryTree = () => load<CategoryNode[]>("/v1/categories", []);

/** Категория для каталога: путь от корня и подкатегории. Нет такой — null. */
export const getCategoryPage = (slug: string) =>
  load<CategoryPage | null>(`/v1/categories/${encodeURIComponent(slug)}`, null);
