"use client";

import Script from "next/script";
import { useRef, useState } from "react";
import type { Coordinates } from "./types";
import { useYandexMap } from "./use-yandex-map";
import styles from "./style.module.scss";

export type { Coordinates } from "./types";
export { geocode, reverseGeocode } from "./geocode";
export { suggestAddresses, type AddressSuggestion } from "./suggest";

type YandexMapProps = {
  point: Coordinates | null;
  onPick?: (point: Coordinates) => void;
};

const API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

const SCRIPT_URL = `https://api-maps.yandex.ru/2.1/?apikey=${API_KEY}&lang=ru_RU`;

/** Яндекс Карта с меткой. С onPick точку можно поставить кликом. Без ключа API не показывается. */
const YandexMap = ({ point, onPick }: YandexMapProps) => {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useYandexMap(container, ready, point, onPick);

  if (!API_KEY) return null;

  return (
    <>
      <Script src={SCRIPT_URL} onReady={() => setReady(true)} />
      <div ref={container} className={styles.map} />
    </>
  );
};

export default YandexMap;
