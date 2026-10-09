import { reportError } from "@/shared/lib/report-error";
import type { Coordinates } from "./types";

const GEOCODER_KEY = process.env.NEXT_PUBLIC_YANDEX_GEOCODER_API_KEY;

const GEOCODER_URL = "https://geocode-maps.yandex.ru/1.x/";

type GeoObject = {
  name: string;
  Point: { pos: string };
};

type GeocoderResponse = {
  response: {
    GeoObjectCollection: { featureMember: { GeoObject: GeoObject }[] };
  };
};

/** Первый найденный объект по запросу геокодера: адресу или координатам «долгота,широта». */
const findFirst = async (query: string): Promise<GeoObject | null> => {
  const params = new URLSearchParams({
    apikey: GEOCODER_KEY ?? "",
    geocode: query,
    format: "json",
    results: "1",
  });

  try {
    const response = await fetch(`${GEOCODER_URL}?${params}`);
    if (!response.ok) return null;

    const data: GeocoderResponse = await response.json();

    return data.response.GeoObjectCollection.featureMember[0]?.GeoObject ?? null;
  } catch (failure) {
    reportError(failure);

    return null;
  }
};

/** Координаты по адресу. Не нашёл — null. */
export const geocode = async (address: string): Promise<Coordinates | null> => {
  const found = await findFirst(address);
  if (!found) return null;

  const [longitude, latitude] = found.Point.pos.split(" ").map(Number);

  return [latitude, longitude];
};

/** Адрес по точке на карте: «улица Ленина, 5». Не нашёл — null. */
export const reverseGeocode = async ([latitude, longitude]: Coordinates) => {
  const found = await findFirst(`${longitude},${latitude}`);

  return found?.name ?? null;
};
