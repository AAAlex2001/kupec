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

/** Заполненные характеристики объявления по его типу. */
export const listingSpecs = (listing: Listing) => {
  const specs = listing.kind === "service" ? serviceSpecs(listing) : productSpecs(listing);

  return specs.filter((spec) => spec.value);
};
