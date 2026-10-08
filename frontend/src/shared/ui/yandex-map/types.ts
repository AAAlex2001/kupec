export type Coordinates = [number, number];

type MapClickEvent = {
  get: (name: "coords") => Coordinates;
};

export type YandexMapInstance = {
  geoObjects: { add: (object: unknown) => void; removeAll: () => void };
  events: { add: (name: "click", handler: (event: MapClickEvent) => void) => void };
  setCenter: (center: Coordinates, zoom?: number) => void;
  destroy: () => void;
};

export type Ymaps = {
  ready: (callback: () => void) => void;
  Map: new (
    element: HTMLElement,
    state: { center: Coordinates; zoom: number; controls: string[] },
  ) => YandexMapInstance;
  Placemark: new (coordinates: Coordinates) => unknown;
};

declare global {
  interface Window {
    ymaps?: Ymaps;
  }
}
