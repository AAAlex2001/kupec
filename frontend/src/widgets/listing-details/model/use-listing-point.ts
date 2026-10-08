"use client";

import { useEffect, useState } from "react";
import { cityAddress } from "@/entities/city";
import type { Listing } from "@/entities/listing";
import { geocode, type Coordinates } from "@/shared/ui/yandex-map";

/** Точка, которую автор поставил на карте, или null. */
const savedPoint = ({ latitude, longitude }: Listing): Coordinates | null =>
  latitude !== null && longitude !== null ? [latitude, longitude] : null;

/** Точка объявления на карте: сохранённая автором, а без неё — центр города. */
export const useListingPoint = (listing: Listing) => {
  const [point, setPoint] = useState(() => savedPoint(listing));
  const { city } = listing;

  useEffect(() => {
    if (point || !city) return;

    let active = true;
    geocode(cityAddress(city)).then((found) => active && setPoint(found));

    return () => {
      active = false;
    };
  }, [point, city]);

  return point;
};
