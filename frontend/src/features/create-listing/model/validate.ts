import type { CategoryField } from "@/entities/attribute";
import { isEmptyDraft } from "../lib/attributes";
import type { ListingErrors, ListingFields } from "./types";

const TITLE_MIN_LENGTH = 3;

/** Ошибки атрибутов: число должно быть числом, обязательные — заполнены при публикации. */
const attributeErrors = (
  fields: ListingFields,
  attributeFields: CategoryField[],
  publish: boolean,
): ListingErrors => {
  const errors: ListingErrors = {};

  for (const field of attributeFields) {
    const draft = fields.attributes[field.slug];
    const key = `attributes.${field.slug}` as const;

    if (isEmptyDraft(draft)) {
      if (publish && field.is_required) errors[key] = `Заполните «${field.name}»`;
    } else if (field.type === "number" && Number.isNaN(Number(draft))) {
      errors[key] = "Введите число";
    }
  }

  return errors;
};

/** Ошибки формы по полям. Для черновика нужно только название, для публикации — всё обязательное. */
export const validateListing = (
  fields: ListingFields,
  attributeFields: CategoryField[],
  publish: boolean,
): ListingErrors => {
  const errors: ListingErrors = attributeErrors(fields, attributeFields, publish);

  if (fields.title.trim().length < TITLE_MIN_LENGTH) errors.title = "Введите название";

  if (!publish) return errors;

  if (!fields.categoryId) errors.categoryId = "Выберите категорию";
  if (!fields.description.trim()) errors.description = "Добавьте описание";
  if (fields.photos.length === 0) errors.photos = "Добавьте хотя бы одно фото";
  if (!(Number(fields.price) > 0)) errors.price = "Укажите цену больше 0";
  if (!fields.unit) errors.unit = "Выберите единицу";
  if (!fields.city) errors.city = "Выберите город";

  if (fields.kind === "service" && fields.servicePlaces.length === 0) {
    errors.servicePlaces = "Укажите, где проходит услуга";
  }

  return errors;
};
