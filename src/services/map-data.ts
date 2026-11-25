import type { ClassifiedDemo, ListingKind } from "@/domain/classified";
import type { MediaAsset } from "@/domain/types";
import { getMedia } from "@/services/catalog";
import { getDemos } from "@/services/classified";
import { getRegionCentre, REGION_CENTRES } from "@/services/region";

export interface MapPoint {
  id: string;
  slug: string;
  title: string;
  kind: ListingKind;
  regionId: string;
  price: number | null;
  priceShort: string;
  place: string;
  media: MediaAsset | null;
  lat: number;
  lng: number;
  demo: true;
}

function jitter(seed: string, salt: number) {
  let hash = salt;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  return (hash / 100000) * 2 - 1;
}

function shortPrice(item: ClassifiedDemo) {
  if (item.price === null) return item.priceLabel || "Даром";
  return `${item.price.toLocaleString("ru-RU")} ₽`;
}

/** Demo map points. Empty unless UI_DEMO_MODE is on. Points without a known region centre are omitted. */
export function getMapPoints(): MapPoint[] {
  const points: MapPoint[] = [];
  for (const item of getDemos()) {
    const centre = REGION_CENTRES[item.regionId];
    if (!centre) continue;
    let media: MediaAsset | null = null;
    try {
      media = getMedia(item.imageId);
    } catch {
      media = null;
    }
    points.push({
      id: item.id,
      slug: item.slug,
      title: item.title,
      kind: item.kind,
      regionId: item.regionId,
      price: item.price,
      priceShort: shortPrice(item),
      place: item.place,
      media,
      lat: centre.lat + jitter(item.id, 7) * 0.05,
      lng: centre.lng + jitter(item.id, 13) * 0.09,
      demo: true,
    });
  }
  return points;
}

export function getInitialMapView(regionId?: string | null) {
  return getRegionCentre(regionId);
}

export const MAP_DEFAULT = getRegionCentre("");

export const MAP_KIND_LABEL: Partial<Record<ListingKind, string>> = {
  realty: "Недвижимость",
  vehicle: "Транспорт",
  job: "Работа",
  resume: "Резюме",
  service: "Услуги",
  goods: "Товары",
  equipment: "Техника",
  business: "Бизнес",
  animal: "Животные",
  free: "Даром",
};
