"use client";

import { useEffect, useState } from "react";
import { searchCities } from "../api/cities";
import type { City } from "./types";

const SEARCH_DELAY = 250;

/** Подсказки городов по введённому тексту, пока список открыт. */
export const useCitySearch = (open: boolean, query: string) => {
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    if (!open) return;

    let active = true;
    const timer = setTimeout(() => {
      searchCities(query.trim())
        .then((found) => active && setCities(found))
        .catch(() => active && setCities([]));
    }, SEARCH_DELAY);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [open, query]);

  return cities;
};
