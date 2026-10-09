import { flattenCategories, type AdminCategory } from "@/entities/category";
import type { ListOption } from "@/shared/ui/option-list";

const ROOT_OPTION = { value: "", label: "Верхний уровень" };

/** Куда можно перенести категорию: верхний уровень или категория того же типа вне её ветки. */
export const parentOptions = (tree: AdminCategory[], category: AdminCategory): ListOption[] => {
  const branch = new Set(flattenCategories([category]).map((line) => line.category.id));

  const options = flattenCategories(tree)
    .filter((line) => line.category.kind === category.kind && !branch.has(line.category.id))
    .map((line) => ({
      value: String(line.category.id),
      label: `${"— ".repeat(line.depth)}${line.category.name}`,
    }));

  return [ROOT_OPTION, ...options];
};
