import { cityLabel } from "@/entities/city";
import type { Review, ReviewableListing } from "@/entities/review";
import type { ReviewTarget } from "../model/types";

/** Шапка формы из объявления, по которому можно оставить отзыв. */
export const targetFromListing = (listing: ReviewableListing): ReviewTarget => ({
  listingId: listing.id,
  title: listing.title,
  coverUrl: listing.cover_url,
  subtitle: [listing.owner.name, listing.city && cityLabel(listing.city)].filter(Boolean).join(" · "),
});

/** Шапка формы из уже написанного отзыва — для правки. */
export const targetFromReview = (review: Review): ReviewTarget => ({
  listingId: review.listing?.id ?? 0,
  title: review.listing?.title ?? "Объявление удалено",
  coverUrl: review.listing?.cover_url ?? null,
  subtitle: review.seller.name ?? "",
});
