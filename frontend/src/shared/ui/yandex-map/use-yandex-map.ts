"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Coordinates, YandexMapInstance } from "./types";

const IRKUTSK: Coordinates = [52.287, 104.281];

const ZOOM = 14;

const REGION_ZOOM = 8;

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
        center: IRKUTSK,
        zoom: REGION_ZOOM,
        controls: ["zoomControl", "geolocationControl"],
      });
      created.events.add("click", (event) => pick.current?.(event.get("coords")));
      setMap(created);
    });

    return () => created?.destroy();
  }, [container, ready]);

  return map;
};

/** Карта с меткой в точке point. Без точки — вся область. */
export const useYandexMap = (
  container: RefObject<HTMLDivElement | null>,
  ready: boolean,
  point: Coordinates | null,
  onPick?: (point: Coordinates) => void,
) => {
  const map = useMapInstance(container, ready, onPick);

  useEffect(() => {
    const ymaps = window.ymaps;
    if (!map || !ymaps || !point) return;

    map.geoObjects.removeAll();
    map.geoObjects.add(new ymaps.Placemark(point));
    map.setCenter(point, ZOOM);
  }, [map, point]);
};
