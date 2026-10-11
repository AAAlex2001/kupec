"use client";

import { useState } from "react";
import { useCityCenter } from "@/entities/city";
import type { Listing } from "@/entities/listing";
import type { Coordinates } from "@/shared/ui/yandex-map";

/** Точка, которую автор поставил на карте, или null. */
const savedPoint = ({ latitude, longitude }: Listing): Coordinates | null =>
  latitude !== null && longitude !== null ? [latitude, longitude] : null;

/** Точка объявления на карте: сохранённая автором, а без неё — центр города. */
export const useListingPoint = (listing: Listing) => {
  const [saved] = useState(() => savedPoint(listing));
  const center = useCityCenter(saved ? null : listing.city);

  return saved ?? center;
};
