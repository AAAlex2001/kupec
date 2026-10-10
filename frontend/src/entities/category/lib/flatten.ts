import type { AdminCategory, CategoryNode } from "../model/types";

export type CategoryLine = {
  category: AdminCategory;
  depth: number;
};

/** Дерево в список строк сверху вниз с глубиной — для таблицы и выбора родителя. */
export const flattenCategories = (nodes: AdminCategory[], depth = 0): CategoryLine[] =>
  nodes.flatMap((category) => [
    { category, depth },
    ...flattenCategories(category.children, depth + 1),
  ]);

/** Адреса всех категорий дерева — для карты сайта. */
export const categorySlugs = (nodes: CategoryNode[]): string[] =>
  nodes.flatMap((category) => [category.slug, ...categorySlugs(category.children)]);
