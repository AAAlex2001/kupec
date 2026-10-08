"use client";

import { geocode, reverseGeocode, type AddressSuggestion, type Coordinates } from "@/shared/ui/yandex-map";
import type { ListingFields } from "./types";

/** Выбор места: подсказка адреса ставит точку на карте, клик по карте подставляет адрес. */
export const useLocationPicker = (onChange: (changes: Partial<ListingFields>) => void) => {
  const choose = async (suggestion: AddressSuggestion) => {
    onChange({ address: suggestion.title });

    const point = await geocode(suggestion.full);
    if (point) onChange({ point });
  };

  const pick = async (point: Coordinates) => {
    onChange({ point });

    const address = await reverseGeocode(point);
    if (address) onChange({ address, point });
  };

  return { choose, pick };
};
