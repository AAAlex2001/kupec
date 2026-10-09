import { formatAttributeValue, type CategoryField } from "@/entities/attribute";
import type { Listing } from "@/entities/listing";

type Spec = {
  label: string;
  value: string;
};

/** Характеристики услуги: категория, где проходит, расписание, город. */
const serviceSpecs = (listing: Listing): Spec[] => [
  { label: "Категория", value: listing.category?.name ?? "" },
  { label: "Где проходит", value: listing.service_place_labels.join(", ") },
  { label: "Расписание", value: listing.schedule ?? "" },
  { label: "Город", value: listing.city?.name ?? "" },
];

/** Характеристики товара: категория, единица цены, получение, город. */
const productSpecs = (listing: Listing): Spec[] => [
  { label: "Категория", value: listing.category?.name ?? "" },
  { label: "Цена за", value: listing.unit_label ?? "" },
  { label: "Получение", value: "Самовывоз" },
  { label: "Город", value: listing.city?.name ?? "" },
];

/** Характеристики из атрибутов категории: «Вес — 3 кг», «Вид — Огурцы». */
const attributeSpecs = (listing: Listing, fields: CategoryField[]): Spec[] =>
  fields.map((field) => ({
    label: field.name,
    value: formatAttributeValue(field, listing.attributes[field.slug]),
  }));

/** Заполненные характеристики объявления: общие по типу, затем атрибуты категории. */
export const listingSpecs = (listing: Listing, fields: CategoryField[]) => {
  const common = listing.kind === "service" ? serviceSpecs(listing) : productSpecs(listing);

  return [...common, ...attributeSpecs(listing, fields)].filter((spec) => spec.value);
};
