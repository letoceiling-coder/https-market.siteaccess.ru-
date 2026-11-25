/**
 * Yandex Maps JavaScript API 3.0 helpers.
 *
 * License notes (checked 2026-11-01):
 * - Official loader: https://api-maps.yandex.ru/v3/?apikey=...&lang=ru_RU
 * - A key is required. JS API 3.0 accepts only keys with HTTP Referer restriction.
 * - Get a key at https://developer.tech.yandex.ru/ for the “JavaScript API и HTTP Геокодер” package.
 * - Do not call paid Geocoder HTTP or other billed services without a separate go-ahead.
 * - Coordinates in the API are [longitude, latitude]. URL params stay lat/lng/z.
 */

export const YANDEX_MAPS_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ?? "";
export const hasYandexMapsKey = YANDEX_MAPS_KEY.length > 8;

export type LngLat = [number, number];

export function toYandexCoords(lat: number, lng: number): LngLat {
  return [lng, lat];
}

export function fromYandexCoords(coords: LngLat) {
  return { lng: coords[0], lat: coords[1] };
}

export function pointInBounds(
  lat: number,
  lng: number,
  bounds: { south: number; west: number; north: number; east: number },
) {
  return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
}

type YMapsReady = {
  ready: Promise<void>;
  import: (pkg: string) => Promise<Record<string, unknown>>;
};

declare global {
  interface Window {
    ymaps3?: YMapsReady;
  }
}

let loading: Promise<YMapsReady> | null = null;

export function loadYandexMaps(key: string) {
  if (typeof window === "undefined") return Promise.reject(new Error("Yandex Maps can load only in the browser"));
  if (window.ymaps3) return window.ymaps3.ready.then(() => window.ymaps3 as YMapsReady);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(key)}&lang=ru_RU`;
    script.async = true;
    const fail = (message: string) => {
      window.clearTimeout(watchdog);
      loading = null;
      reject(new Error(message));
    };
    const watchdog = window.setTimeout(() => {
      if (!window.ymaps3) fail("Яндекс Карты не ответили");
    }, 8000);
    script.onload = () => {
      if (!window.ymaps3) {
        fail("ymaps3 is missing after script load");
        return;
      }
      window.clearTimeout(watchdog);
      window.ymaps3.ready.then(() => resolve(window.ymaps3 as YMapsReady)).catch((error) => fail(String(error)));
    };
    script.onerror = () => fail("Не удалось загрузить Яндекс Карты");
    document.head.appendChild(script);
  });
  return loading;
}
