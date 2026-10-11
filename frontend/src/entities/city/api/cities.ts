import { request } from "@/shared/api";
import type { City } from "../model/types";

/** Населённые пункты по началу названия, по желанию — в одном регионе. Без запроса — крупные города. */
export const searchCities = (query: string, region: string) => {
  const params = new URLSearchParams({ q: query, limit: "20" });
  if (region) params.set("region", region);

  return request<City[]>(`/v1/cities?${params}`);
};

/** Все регионы справочника по алфавиту. */
export const fetchRegions = () => request<string[]>("/v1/cities/regions");
