import { listingPath } from "@/shared/config/routes";
import type { Listing } from "../model/types";

/** Данные карточки в выдаче из объявления. */
export const listingCard = (listing: Listing) => ({
  photoUrl: listing.photos[0]?.url ?? null,
  price: listing.price,
  unitLabel: listing.unit_label,
  title: listing.title,
  author: listing.owner.name ?? "",
  place: listing.city?.name ?? "",
  conditions:
    listing.kind === "service" ? listing.service_place_labels.join(" · ") : "Самовывоз",
  href: listingPath(listing.id),
});
