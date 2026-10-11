import { request } from "@/shared/api";
import type { City } from "../model/types";

/** Населённые пункты по началу названия. Без запроса — крупные города. */
export const searchCities = (query: string) =>
  request<City[]>(`/v1/cities?q=${encodeURIComponent(query)}&limit=20`);
