import type { ListingErrors, ListingFields } from "./types";

const TITLE_MIN_LENGTH = 3;

/** Ошибки формы по полям. Для черновика нужно только название, для публикации — всё обязательное. */
export const validateListing = (fields: ListingFields, publish: boolean): ListingErrors => {
  const errors: ListingErrors = {};

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
