import type { Listing } from "@/entities/listing";
import type { AttachedListing } from "@/entities/post";

/** Своё объявление в виде, в каком оно показывается в посте. */
export const toAttached = (listing: Listing): AttachedListing => ({
  id: listing.id,
  title: listing.title,
  price: listing.price,
  unit_label: listing.unit_label,
  cover_url: listing.photos[0]?.url ?? null,
  status: listing.status,
  category: listing.category,
});
