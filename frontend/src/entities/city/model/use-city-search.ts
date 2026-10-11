"use client";

import { useEffect, useState } from "react";
import { reportError } from "@/shared/lib/report-error";
import { searchCities } from "../api/cities";
import type { City } from "./types";

const SEARCH_DELAY = 250;

type SearchResult = {
  query: string;
  region: string;
  cities: City[];
};

/** Подсказки пунктов по введённому тексту и региону, пока список открыт. Ответ на старый запрос не показывается. */
export const useCitySearch = (open: boolean, query: string, region: string) => {
  const [result, setResult] = useState<SearchResult | null>(null);
  const text = query.trim();

  useEffect(() => {
    if (!open) return;

    let active = true;
    const timer = setTimeout(() => {
      searchCities(text, region)
        .then((cities) => active && setResult({ query: text, region, cities }))
        .catch(reportError);
    }, SEARCH_DELAY);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [open, text, region]);

  const fresh = result?.query === text && result.region === region;

  return fresh ? result.cities : [];
};
