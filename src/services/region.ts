import { getRegion } from "@/services/catalog";

export const REGION_CENTRES: Record<string, { lat: number; lng: number; zoom: number }> = {
  moskva: { lat: 55.7558, lng: 37.6173, zoom: 11 },
  "moskovskaya-oblast": { lat: 55.81, lng: 37.95, zoom: 9 },
  "sankt-peterburg": { lat: 59.9343, lng: 30.3351, zoom: 11 },
  "leningradskaya-oblast": { lat: 59.7, lng: 30.9, zoom: 9 },
  "kaluzhskaya-oblast": { lat: 54.5293, lng: 36.2754, zoom: 11 },
  "tulskaya-oblast": { lat: 54.1931, lng: 37.6173, zoom: 11 },
  "krasnodarskiy-kray": { lat: 45.0355, lng: 38.9753, zoom: 10 },
  tatarstan: { lat: 55.7963, lng: 49.1088, zoom: 11 },
  "sverdlovskaya-oblast": { lat: 56.8389, lng: 60.6057, zoom: 11 },
  "novosibirskaya-oblast": { lat: 55.0084, lng: 82.9357, zoom: 11 },
  komi: { lat: 64.0, lng: 54.0, zoom: 6 },
  syktyvkar: { lat: 61.6688, lng: 50.8364, zoom: 12 },
};

export const DEFAULT_MAP_VIEW = { lat: 61.5, lng: 90, zoom: 3 };

export function getRegionCentre(regionId: string | undefined | null) {
  if (!regionId) return DEFAULT_MAP_VIEW;
  return REGION_CENTRES[regionId] ?? DEFAULT_MAP_VIEW;
}

export function matchesRegion<T extends { regionId: string }>(items: T[], regionId: string | undefined | null) {
  if (!regionId) return items;
  return items.filter((item) => item.regionId === regionId);
}

export function regionLabel(regionId: string | undefined | null, fallback = "Россия") {
  if (!regionId) return fallback;
  return getRegion(regionId)?.name ?? fallback;
}
