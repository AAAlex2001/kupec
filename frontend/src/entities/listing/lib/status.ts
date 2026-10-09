import type { ListingStatus } from "../model/types";

export const STATUS_TABS: { value: ListingStatus; label: string }[] = [
  { value: "published", label: "Активные" },
  { value: "draft", label: "Черновики" },
  { value: "archived", label: "Снятые" },
];
