"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Coordinates, YandexMapInstance } from "./types";

const RUSSIA: Coordinates = [61.5, 105.3];

const COUNTRY_ZOOM = 3;

const CITY_ZOOM = 11;

const ZOOM = 14;

/** Создаёт карту в контейнере, когда скрипт загружен. Клик по карте отдаёт точку в onPick. */
const useMapInstance = (
  container: RefObject<HTMLDivElement | null>,
  ready: boolean,
  onPick?: (point: Coordinates) => void,
) => {
  const [map, setMap] = useState<YandexMapInstance | null>(null);
  const pick = useRef(onPick);

  useEffect(() => {
    pick.current = onPick;
  }, [onPick]);

  useEffect(() => {
    const ymaps = window.ymaps;
    const element = container.current;
    if (!ready || !ymaps || !element) return;

    let created: YandexMapInstance | null = null;

    ymaps.ready(() => {
      created = new ymaps.Map(element, {
        center: RUSSIA,
        zoom: COUNTRY_ZOOM,
        controls: ["zoomControl", "geolocationControl"],
      });
      created.events.add("click", (event) => pick.current?.(event.get("coords")));
      setMap(created);
    });

    return () => created?.destroy();
  }, [container, ready]);

  return map;
};

/** Карта с меткой в точке point. Без точки — центр пункта center, а без него — вся Россия. */
export const useYandexMap = (
  container: RefObject<HTMLDivElement | null>,
  ready: boolean,
  point: Coordinates | null,
  center: Coordinates | null,
  onPick?: (point: Coordinates) => void,
) => {
  const map = useMapInstance(container, ready, onPick);

  useEffect(() => {
    if (!map || point || !center) return;

    map.setCenter(center, CITY_ZOOM);
  }, [map, point, center]);

  useEffect(() => {
    const ymaps = window.ymaps;
    if (!map || !ymaps || !point) return;

    map.geoObjects.removeAll();
    map.geoObjects.add(new ymaps.Placemark(point));
    map.setCenter(point, ZOOM);
  }, [map, point]);
};
