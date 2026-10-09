import type { CategoryNode } from "../model/types";

const SEARCH_LIMIT = 30;

/** Все категории дерева с путём от корня: [Электроника], [Электроника, Телефоны], … */
export const categoryChains = (
  nodes: CategoryNode[],
  parents: CategoryNode[] = [],
): CategoryNode[][] =>
  nodes.flatMap((node) => [
    [...parents, node],
    ...categoryChains(node.children, [...parents, node]),
  ]);

/** Последняя категория пути — та, что выбрана. */
export const lastOf = (chain: CategoryNode[]) => chain[chain.length - 1];

/** Путь до категории по id. Нет такой — пустой путь. */
export const chainOf = (tree: CategoryNode[], categoryId: number | null) =>
  categoryChains(tree).find((chain) => lastOf(chain).id === categoryId) ?? [];

/** Категории, в названии которых есть запрос, вместе с путём. */
export const searchChains = (tree: CategoryNode[], query: string) => {
  const text = query.trim().toLowerCase();
  if (!text) return [];

  return categoryChains(tree)
    .filter((chain) => lastOf(chain).name.toLowerCase().includes(text))
    .slice(0, SEARCH_LIMIT);
};

/** Путь словами: «Электроника › Аудио и видео › Проекторы». */
export const chainLabel = (chain: CategoryNode[]) => chain.map((node) => node.name).join(" › ");
