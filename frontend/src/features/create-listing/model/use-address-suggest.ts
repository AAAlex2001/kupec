"use client";

import { useEffect, useState } from "react";
import { cityAddress, type City } from "@/entities/city";
import { suggestAddresses, type AddressSuggestion } from "@/shared/ui/yandex-map";

const SEARCH_DELAY = 300;

const MIN_LENGTH = 3;

/** Подсказки адресов в выбранном пункте с регионом и районом, пока список открыт и введено от трёх букв. */
export const useAddressSuggest = (open: boolean, query: string, city: City | null) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const text = query.trim();
  const enabled = open && text.length >= MIN_LENGTH;

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    const timer = setTimeout(() => {
      suggestAddresses(city ? cityAddress(city, text) : text).then(
        (found) => active && setSuggestions(found),
      );
    }, SEARCH_DELAY);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [enabled, text, city]);

  return enabled ? suggestions : [];
};
