import type { UnitKind } from "@/entities/unit";

export const UNIT_KINDS: { value: UnitKind; label: string }[] = [
  { value: "product", label: "Для товаров" },
  { value: "service", label: "Для услуг" },
];

/** Тип единицы по-русски: «Для товаров». */
export const unitKindLabel = (kind: UnitKind) =>
  UNIT_KINDS.find((item) => item.value === kind)?.label ?? kind;
