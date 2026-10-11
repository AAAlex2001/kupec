"use client";

import { useEffect, useState } from "react";
import { geocode, type Coordinates } from "@/shared/ui/yandex-map";
import { cityAddress } from "../lib/label";
import type { City } from "./types";

/** Центр населённого пункта для карты по геокодеру Яндекса. Без пункта или пока ищем — null. */
export const useCityCenter = (city: City | null) => {
  const [center, setCenter] = useState<Coordinates | null>(null);

  useEffect(() => {
    if (!city) return;

    let active = true;
    geocode(cityAddress(city)).then((found) => active && setCenter(found));

    return () => {
      active = false;
    };
  }, [city]);

  return city ? center : null;
};
