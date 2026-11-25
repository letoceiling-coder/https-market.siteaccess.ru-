import demosJson from "@/data/demo/ui-demo-listings.json";
import taxonomyJson from "@/data/taxonomy.json";
import type { CategoryAttribute, ClassifiedDemo, TaxonNode, TaxonomyFile } from "@/domain/classified";
import { normalize } from "@/domain/text";
import type { SearchDocument } from "@/domain/types";
import { UI_DEMO_MODE } from "@/services/demo-mode";

const taxonomy = taxonomyJson as unknown as TaxonomyFile;
const demoRecords = demosJson as unknown as ClassifiedDemo[];
const byId = new Map(taxonomy.nodes.map((node) => [node.id, node]));
const byPath = new Map(taxonomy.nodes.map((node) => [node.path, node]));

export function getPolicy() {
  return taxonomy.policy;
}

export function getTaxonNodes() {
  return taxonomy.nodes;
}

export function getTaxonRoots() {
  return taxonomy.nodes.filter((node) => node.parentId === null).sort((a, b) => a.order - b.order);
}

export function getTaxon(path: string) {
  return byPath.get(path);
}

export function getTaxonChildren(id: string | null) {
  return taxonomy.nodes.filter((node) => node.parentId === id).sort((a, b) => a.order - b.order);
}

export function getTaxonBreadcrumb(node: TaxonNode) {
  const items: TaxonNode[] = [];
  let current: TaxonNode | undefined = node;
  while (current) {
    items.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return items;
}

export function getAttributes(node: TaxonNode): CategoryAttribute[] {
  return taxonomy.attributeSets[node.attributeSet] ?? [];
}

/** Demo cards exist only while UI_DEMO_MODE is on. Public mode always returns an empty list. */
export function getDemos() {
  return UI_DEMO_MODE ? demoRecords : [];
}

/** Static params for /samples. Never used to render content when demo mode is off. */
export function getDemoSlugs() {
  return demoRecords.map((item) => item.slug);
}

export function getDemo(slug: string) {
  return getDemos().find((item) => item.slug === slug);
}

export function demosForNode(node: TaxonNode) {
  return getDemos().filter((item) => item.categoryPath === node.path || item.categoryPath.startsWith(`${node.path}/`));
}

const RESERVED = ["sort", "page", "q", "radius", "priceMin", "priceMax"];

export function searchDemos(items: ClassifiedDemo[], query: string) {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return items;
  return items.filter((item) => {
    const haystack = normalize([item.title, ...item.facts, item.place].join(" "));
    return tokens.every((token) => haystack.includes(token));
  });
}

export function filterDemos(items: ClassifiedDemo[], query: Record<string, string | undefined>) {
  const radius = query.radius?.trim();
  if (radius) return []; // Demo cards have no coordinates, so a radius cannot be evaluated honestly.
  const priceMin = Number(query.priceMin);
  const priceMax = Number(query.priceMax);
  return items.filter((item) => {
    if (query.priceMin && !Number.isNaN(priceMin) && (item.price === null || item.price < priceMin)) return false;
    if (query.priceMax && !Number.isNaN(priceMax) && (item.price === null || item.price > priceMax)) return false;
    return Object.entries(query).every(([key, value]) => {
      if (!value || RESERVED.includes(key)) return true;
      if (key.endsWith("Min") || key.endsWith("Max")) {
        const raw = item.attributes[key.slice(0, -3)];
        const current = Number(raw);
        const limit = Number(value);
        if (raw === undefined || raw === "" || Number.isNaN(current) || Number.isNaN(limit)) return false;
        return key.endsWith("Min") ? current >= limit : current <= limit;
      }
      const current = item.attributes[key];
      if (current === undefined) return false; // A card without this characteristic cannot match the filter.
      if (key === "brand") return normalize(current).includes(normalize(value));
      return current === value;
    });
  });
}

export function sortDemos(items: ClassifiedDemo[], sort: string | undefined) {
  const copy = [...items];
  if (sort === "price-asc") return copy.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  if (sort === "price-desc") return copy.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
  if (sort === "area") return copy.sort((a, b) => Number(a.attributes.area ?? 0) - Number(b.attributes.area ?? 0));
  if (sort === "year") return copy.sort((a, b) => Number(b.attributes.year ?? 0) - Number(a.attributes.year ?? 0));
  return copy.sort((a, b) => b.postedAt.localeCompare(a.postedAt) || a.title.localeCompare(b.title, "ru"));
}

export function taxonomyDocuments(): SearchDocument[] {
  return taxonomy.nodes.map((node) => ({
    id: node.id,
    type: "category" as const,
    title: node.name,
    href: `/catalog/${node.path}`,
    text: node.description,
  }));
}

export function popularTaxa() {
  const paths = [
    "nedvizhimost/kvartiry",
    "transport/legkovye",
    "rabota/vakansii",
    "uslugi",
    "elektronika/smartfony",
    "dom-i-dacha/mebel",
    "zhivotnye/sobaki",
    "darom",
  ];
  return paths.map((path) => byPath.get(path)).filter((item): item is TaxonNode => item !== undefined);
}
