import { cookies } from "next/headers";
import { cache } from "react";
import { load } from "@/shared/api/server";
import { LOCATION_COOKIE } from "../lib/location-cookie";
import type { City } from "../model/types";

/** Где посетитель ищет объявления — из cookie. null — вся область. Один запрос на страницу. */
export const getLocation = cache(async () => {
  const cityId = Number((await cookies()).get(LOCATION_COOKIE)?.value);

  return cityId > 0 ? load<City | null>(`/v1/cities/${cityId}`, null) : null;
});
