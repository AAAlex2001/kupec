import { cityLabel } from "@/entities/city";
import type { Review, ReviewStatus } from "../model/types";

export const STATUS_LABELS: Record<ReviewStatus, string> = {
  published: "Опубликован",
  pending: "На проверке",
  rejected: "Отклонён",
};

/** Подпись под объявлением: «Автор: Наталья · Ангарск, улица Ленина, 5». */
export const reviewSellerLine = (review: Review) => {
  const parts = [review.seller.name ?? "Продавец"];
  if (review.listing?.city) parts.push(cityLabel(review.listing.city));
  if (review.listing?.address) parts.push(review.listing.address);

  return `Автор: ${parts.join(" · ")}`;
};
