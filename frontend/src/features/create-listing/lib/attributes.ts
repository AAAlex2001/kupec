import type { AttributeValue, AttributeValues, CategoryField } from "@/entities/attribute";
import type { AttributeDraft, AttributeDrafts } from "../model/types";

/** Поле не заполнено: пустая строка или пустой список. «Нет» у флажка — тоже значение. */
export const isEmptyDraft = (draft: AttributeDraft | undefined) =>
  draft === undefined || draft === "" || (Array.isArray(draft) && draft.length === 0);

/** Значение для бэкенда: число из строки, остальное как есть. */
const toValue = (field: CategoryField, draft: AttributeDraft): AttributeValue =>
  field.type === "number" ? Number(draft) : draft;

/** Значения атрибутов для запроса: только поля этой категории и только заполненные. */
export const attributesPayload = (
  drafts: AttributeDrafts,
  fields: CategoryField[],
): AttributeValues =>
  Object.fromEntries(
    fields
      .filter((field) => !isEmptyDraft(drafts[field.slug]))
      .map((field) => [field.slug, toValue(field, drafts[field.slug])]),
  );

/** Значения сохранённого объявления для полей формы: числа — строками. */
export const attributeDrafts = (values: AttributeValues): AttributeDrafts =>
  Object.fromEntries(
    Object.entries(values).map(([slug, value]) => [
      slug,
      typeof value === "number" ? String(value) : value,
    ]),
  );
