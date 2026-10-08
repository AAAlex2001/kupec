import type { ListingKind } from "@/entities/listing";

export const ALL = "all";

export const TABS: { value: ListingKind | typeof ALL; label: string }[] = [
  { value: ALL, label: "Все" },
  { value: "service", label: "Услуги" },
  { value: "product", label: "Товары" },
];

export const LISTINGS: [string, string, string] = ["объявление", "объявления", "объявлений"];
