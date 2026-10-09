"use client";

import { useState } from "react";
import { chainOf, lastOf, searchChains } from "../lib/chains";
import type { CategoryNode } from "./types";

const ROOT_LABEL = "Все категории";

/** Выбор категории: открытый путь, колонки для ПК, текущий уровень для мобилки и поиск. */
export const useCategoryPicker = (tree: CategoryNode[], selectedId: number | null) => {
  const [chain, setChain] = useState(() => chainOf(tree, selectedId));
  const [query, setQuery] = useState("");

  const opened = chain.filter((node) => node.children.length > 0);
  const columns = [tree, ...opened.map((node) => node.children)];
  const level = columns.length - 1;
  const selected = chain.length > 0 ? lastOf(chain) : null;
  const backLabel = opened.length > 1 ? opened[opened.length - 2].name : ROOT_LABEL;

  const open = (depth: number, node: CategoryNode) => setChain([...chain.slice(0, depth), node]);

  const back = () => setChain(opened.slice(0, -1));

  const choose = (found: CategoryNode[]) => {
    setChain(found);
    setQuery("");
  };

  return {
    chain,
    columns,
    level,
    selected,
    backLabel,
    query,
    results: searchChains(tree, query),
    setQuery,
    open,
    back,
    choose,
  };
};
