import type { MapPoint } from "@/services/map-data";

export function markerHtml(point: MapPoint, selected: boolean) {
  const label = escapeHtml(point.priceShort);
  return `<button type="button" class="hh-pin ${selected ? "hh-pin-active" : ""}">${label}</button>`;
}

export function clusterHtml(count: number) {
  return `<span class="hh-cluster">${count}</span>`;
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
