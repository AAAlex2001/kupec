import { formatRub } from "@/shared/lib/format";
import type { AttachedListing } from "../model/types";

const STATUS_LABELS = { published: "Активно", draft: "Черновик", archived: "Снято" };

/** Подпись над объявлением: «Объявление · Активно · Массаж». */
export const listingMeta = (listing: AttachedListing) =>
  ["Объявление", STATUS_LABELS[listing.status], listing.category?.name].filter(Boolean).join(" · ");

/** Цена объявления: «1 800 ₽ / сеанс». */
export const listingPrice = (listing: AttachedListing) => {
  if (!listing.price) return "Цена не указана";
  if (!listing.unit_label) return formatRub(listing.price);

  return `${formatRub(listing.price)} / ${listing.unit_label}`;
};
