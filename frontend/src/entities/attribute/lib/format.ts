import type { Attribute, AttributeType, AttributeValue } from "../model/types";

/** Подпись варианта по значению: «ogurcy» → «Огурцы». */
const optionLabel = (attribute: Attribute, value: string) =>
  attribute.options.find((option) => option.value === value)?.label;

const FORMATTERS: Record<AttributeType, (attribute: Attribute, value: AttributeValue) => string> = {
  number: (attribute, value) => [String(value), attribute.unit].filter(Boolean).join(" "),
  select: (attribute, value) => optionLabel(attribute, String(value)) ?? "",
  multiselect: (attribute, value) =>
    (Array.isArray(value) ? value : [])
      .map((item) => optionLabel(attribute, item))
      .filter(Boolean)
      .join(", "),
  boolean: (_attribute, value) => (value ? "Да" : "Нет"),
  text: (_attribute, value) => String(value),
};

/** Значение атрибута для показа: «3 кг», «Огурцы, Томаты», «Да». Пусто — пустая строка. */
export const formatAttributeValue = (attribute: Attribute, value: AttributeValue | undefined) =>
  value === undefined ? "" : FORMATTERS[attribute.type](attribute, value);
