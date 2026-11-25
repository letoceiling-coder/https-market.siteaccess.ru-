import { clusterHtml } from "@/components/map/map-listing-marker";

export function createClusterElement(count: number) {
  const node = document.createElement("div");
  node.innerHTML = clusterHtml(count);
  return node.firstElementChild as HTMLElement;
}
