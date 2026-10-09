import type { AttributeType } from "../model/types";

export const ATTRIBUTE_TYPES: { value: AttributeType; label: string }[] = [
  { value: "select", label: "Один из списка" },
  { value: "multiselect", label: "Несколько из списка" },
  { value: "number", label: "Число" },
  { value: "boolean", label: "Да или нет" },
  { value: "text", label: "Текст" },
];

/** Тип атрибута по-русски: «Один из списка». */
export const attributeTypeLabel = (type: AttributeType) =>
  ATTRIBUTE_TYPES.find((item) => item.value === type)?.label ?? type;

/** Есть ли у типа список вариантов. */
export const hasOptions = (type: AttributeType) => type === "select" || type === "multiselect";
